import { React, type AllWidgetProps, MessageManager, DataRecordSetChangeMessage, RecordSetChangeType, MutableStoreManager } from 'jimu-core'
import { type IMConfig } from '../../config'
import { TYPE_FLAG_CONFIG, TYPE_FLAG_ORDER, FEAT_CLS_ORDER } from '../../../../shared-code/type-flag-config'
import { queryFeatureLayer } from '../../../../shared-code/direct-query'
import './style.css'

const { useState, useEffect, useCallback, useRef } = React

interface KpiData {
  label: string
  typeFlag: string
  featCLS: string
  count: number
  category: 'active' | 'inactive' | 'historic'
}

const CATEGORY_MAP: Record<string, 'active' | 'inactive' | 'historic'> = {
  ACT: 'active',
  INACT: 'inactive',
  RECNF: 'historic'
}

/**
 * Mine KPI Cards widget — indicator strip showing counts by Type_Flag × FeatCLS.
 */
const Widget = (props: AllWidgetProps<IMConfig>): React.JSX.Element => {
  const [stats, setStats] = useState<KpiData[]>([])
  const [error, setError] = useState(false)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const mountedRef = useRef(true)

  /** Fetch KPI statistics via direct REST query */
  const loadStats = useCallback(async () => {
    setError(false)

    try {
      const result = await queryFeatureLayer({
        outStatistics: [{
          statisticType: 'count',
          onStatisticField: 'OBJECTID',
          outStatisticFieldName: 'cnt'
        }],
        groupByFieldsForStatistics: ['Type_Flag', 'FeatCLS']
      })

      if (!mountedRef.current) return

      const data: KpiData[] = result.features
        .map((f) => {
          const attrs = f.attributes
          const tf = String(attrs.Type_Flag || '')
          const fc = String(attrs.FeatCLS || '')
          const cnt = Number(attrs.cnt || 0)
          const cfg = TYPE_FLAG_CONFIG[tf]
          if (!cfg) return null

          return {
            label: `${cfg.label} ${fc === 'SF' ? 'SF' : 'UG'}`,
            typeFlag: tf,
            featCLS: fc,
            count: cnt,
            category: CATEGORY_MAP[tf] ?? 'historic'
          } satisfies KpiData
        })
        .filter(Boolean) as KpiData[]

      data.sort((a, b) => {
        const aIdx = TYPE_FLAG_ORDER.indexOf(a.typeFlag)
        const bIdx = TYPE_FLAG_ORDER.indexOf(b.typeFlag)
        if (aIdx !== bIdx) return aIdx - bIdx
        const aFIdx = FEAT_CLS_ORDER.indexOf(a.featCLS)
        const bFIdx = FEAT_CLS_ORDER.indexOf(b.featCLS)
        return aFIdx - bFIdx
      })

      setStats(data)
    } catch (err) {
      console.error('KPI fetch failed:', err)
      if (mountedRef.current) setError(true)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    loadStats()

    // Fix ExB framework empty buttons — mark hidden icon-only layout buttons as aria-hidden
    // These are invisible (0×0) jimu-btn icon-btn wrappers ExB generates around widgets
    const fixEmptyButtons = () => {
      document.querySelectorAll('button.icon-btn.btn-tertiary').forEach((btn) => {
        const rect = (btn as HTMLElement).getBoundingClientRect()
        const hasLabel = btn.getAttribute('aria-label') || btn.getAttribute('title') || (btn.textContent || '').trim()
        if (rect.width === 0 && rect.height === 0 && !hasLabel) {
          btn.setAttribute('aria-hidden', 'true')
          btn.setAttribute('tabindex', '-1')
        }
      })
    }
    // Run after ExB finishes rendering
    const timer = setTimeout(fixEmptyButtons, 2000)

    return () => {
      mountedRef.current = false
      clearTimeout(timer)
    }
  }, [loadStats])

  /** Handle card click — toggle selection and publish cross-filter */
  const handleClick = useCallback((typeFlag: string, featCLS: string) => {
    const key = `${typeFlag}-${featCLS}`
    const isDeselect = selectedKey === key
    const newKey = isDeselect ? null : key

    setSelectedKey(newKey)

    // Write shared state for other widgets
    MutableStoreManager.getInstance().updateStateValue(props.id, 'activeTypeFlag', isDeselect ? null : typeFlag)
    MutableStoreManager.getInstance().updateStateValue(props.id, 'activeFeatCLS', isDeselect ? null : featCLS)

    // Publish cross-filter message
    MessageManager.getInstance().publishMessage(
      new DataRecordSetChangeMessage(props.id, isDeselect ? RecordSetChangeType.Remove : RecordSetChangeType.Update, null)
    )
  }, [selectedKey, props.id])

  const total = stats.reduce((sum, s) => sum + s.count, 0)

  if (error) {
    return (
      <section className="jimu-widget widget-mine-kpi-cards indicator-strip" role="region" aria-label="Permit summary indicators">
        <h1 className="sr-only">Kentucky Mine Permits Dashboard</h1>
        <div className="indicator" style={{ flex: 'unset', width: '100%', cursor: 'default' }}>
          <div className="indicator__label">
            Failed to load data.{' '}
            <button
              className="retry-btn"
              onClick={loadStats}
              aria-label="Retry loading permit data"
              title="Retry loading permit data"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (stats.length === 0) {
    return (
      <section className="jimu-widget widget-mine-kpi-cards indicator-strip" role="region" aria-label="Permit summary indicators">
        <h1 className="sr-only">Kentucky Mine Permits Dashboard</h1>
        <div className="indicator" style={{ flex: 'unset', width: '100%', cursor: 'default' }} aria-busy="true">
          <div className="indicator__label">Loading mine data...</div>
        </div>
      </section>
    )
  }

  return (
    <section className="jimu-widget widget-mine-kpi-cards indicator-strip" role="region" aria-label="Permit summary indicators">
      <h1 className="sr-only">Kentucky Mine Permits Dashboard</h1>
      {stats.map((s) => {
        const key = `${s.typeFlag}-${s.featCLS}`
        const selected = selectedKey === key
        return (
          <button
            key={key}
            className={`indicator indicator--${s.category}${selected ? ' indicator--selected' : ''}`}
            onClick={() => handleClick(s.typeFlag, s.featCLS)}
            aria-pressed={selected}
            aria-label={`${s.label}: ${s.count.toLocaleString()} permits${selected ? ', selected' : ''}`}
            title={`${s.label}: ${s.count.toLocaleString()} permits — click to filter`}
          >
            <div className="indicator__value" aria-hidden="true">{s.count.toLocaleString()}</div>
            <div className="indicator__label" aria-hidden="true">{s.label}</div>
          </button>
        )
      })}
      <div className="indicator indicator--total" role="status" aria-label={`Total: ${total.toLocaleString()} permits`} title={`Total: ${total.toLocaleString()} permits`}>
        <div className="indicator__value">{total.toLocaleString()}</div>
        <div className="indicator__label">Total</div>
      </div>
    </section>
  )
}

export default Widget
