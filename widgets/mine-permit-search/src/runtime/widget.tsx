import { React, type AllWidgetProps, MessageManager, DataRecordSetChangeMessage, RecordSetChangeType, MutableStoreManager } from 'jimu-core'
import { TextInput } from 'jimu-ui'
import { type IMConfig } from '../../config'
import { SEARCH_DEBOUNCE_MS } from '../../../../shared-code/constants'
import { queryFeatureLayer } from '../../../../shared-code/direct-query'
import './style.css'

const { useState, useCallback, useRef, useEffect } = React

interface PermitResult {
  permitNo: string
  perName: string
  featCLS: string
  mineStatu: string
  typeFlagLabel: string
}

const TYPE_FLAG_LABELS: Record<string, string> = {
  ACT: 'Active',
  INACT: 'Inactive',
  RECNF: 'Historic'
}

/**
 * Mine Permit Search widget — live results appear as you type.
 * Double-click a result to select it.
 */
const Widget = (props: AllWidgetProps<IMConfig>): React.JSX.Element => {
  const [results, setResults] = useState<PermitResult[]>([])
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [selected, setSelected] = useState<PermitResult | null>(null)
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  /** Search for permits matching the input */
  const doSearch = useCallback(async (term: string) => {
    if (term.length < 2) {
      setResults([])
      setOpen(false)
      setSearching(false)
      return
    }

    setSearching(true)

    try {
      const escaped = term.replace(/'/g, "''")
      const result = await queryFeatureLayer({
        where: `PermitNo LIKE '%${escaped}%'`,
        outFields: ['PermitNo', 'PER_NAME', 'FeatCLS', 'MINE_STATU', 'Type_Flag'],
        returnGeometry: false,
        resultRecordCount: 10
      })

      const data: PermitResult[] = result.features.map((f) => ({
        permitNo: String(f.attributes.PermitNo || ''),
        perName: String(f.attributes.PER_NAME || ''),
        featCLS: String(f.attributes.FeatCLS || ''),
        mineStatu: String(f.attributes.MINE_STATU || ''),
        typeFlagLabel: TYPE_FLAG_LABELS[String(f.attributes.Type_Flag || '')] || 'Unknown'
      }))

      setResults(data)
      setOpen(data.length > 0)
    } catch (err) {
      console.error('Permit search failed:', err)
    } finally {
      setSearching(false)
    }
  }, [])

  /** Debounced input handler */
  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)
    setSelected(null)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (val.length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    setSearching(true)
    debounceRef.current = setTimeout(() => {
      doSearch(val)
    }, SEARCH_DEBOUNCE_MS)
  }, [doSearch])

  /** Handle selection — publish cross-filter */
  const handleSelect = useCallback((result: PermitResult) => {
    setSelected(result)
    setInputValue(result.permitNo)
    setOpen(false)

    MutableStoreManager.getInstance().updateStateValue(props.id, 'selectedPermit', result.permitNo)

    MessageManager.getInstance().publishMessage(
      new DataRecordSetChangeMessage(props.id, RecordSetChangeType.Update, null)
    )
  }, [props.id])

  /** Handle keyboard navigation */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false)
    }
  }, [])

  /** Close dropdown on click outside */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <section className="jimu-widget widget-mine-permit-search search-wrapper" role="search" aria-label="Permit search" ref={wrapperRef}>
      <h2 className="sr-only">Permit Search</h2>
      <TextInput
        value={inputValue}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (results.length > 0) setOpen(true) }}
        placeholder="Search permit number..."
        aria-label="Search permits by permit number"
        aria-expanded={open}
        aria-controls="permit-search-results"
        aria-autocomplete="list"
        role="combobox"
        size="sm"
      />

      {searching && (
        <div className="search-status" aria-live="polite">Searching...</div>
      )}

      {open && results.length > 0 && (
        <div
          id="permit-search-results"
          className="search-dropdown"
          role="listbox"
          aria-label="Permit search results"
        >
          {results.map((r) => (
            <div
              key={r.permitNo}
              className={`search-result${selected?.permitNo === r.permitNo ? ' search-result--selected' : ''}`}
              role="option"
              tabIndex={0}
              aria-selected={selected?.permitNo === r.permitNo}
              onClick={() => handleSelect(r)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSelect(r) }}
              aria-label={`Permit ${r.permitNo}: ${r.perName}, ${r.typeFlagLabel} ${r.featCLS === 'SF' ? 'Surface' : 'Underground'}`}
              title={`${r.permitNo} — ${r.perName} (${r.typeFlagLabel} ${r.featCLS === 'SF' ? 'Surface' : 'Underground'})`}
            >
              <span className="search-result__permit">{r.permitNo}</span>
              <span className="search-result__detail">
                {r.perName} — {r.typeFlagLabel} {r.featCLS === 'SF' ? 'Surface' : 'Underground'}
              </span>
            </div>
          ))}
          <div className="search-hint" aria-hidden="true">Click or press Enter to select</div>
        </div>
      )}

      {open && results.length === 0 && inputValue.length >= 2 && !searching && (
        <div className="search-dropdown search-no-results" role="status">
          No permits found
        </div>
      )}
    </section>
  )
}

export default Widget
