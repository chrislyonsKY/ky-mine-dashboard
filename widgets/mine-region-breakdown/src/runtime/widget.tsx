import { React, type AllWidgetProps, MessageManager, DataRecordSetChangeMessage, RecordSetChangeType, MutableStoreManager } from 'jimu-core'
import { type IMConfig } from '../../config'
import { queryFeatureLayer } from '../../../../shared-code/direct-query'
import './style.css'

const { useState, useEffect, useCallback, useRef } = React

interface RegionData {
  region: string
  count: number
}

/**
 * Capitalize region name: "PIKEVILLE" → "Pikeville"
 */
function titleCase (s: string): string {
  return s.charAt(0) + s.slice(1).toLowerCase()
}

/**
 * Mine Region Breakdown widget — list of DMP regional offices with permit counts.
 */
const Widget = (props: AllWidgetProps<IMConfig>): React.JSX.Element => {
  const [regions, setRegions] = useState<RegionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const mountedRef = useRef(true)

  /** Handle region row click — toggle selection and publish cross-filter */
  const handleRowClick = useCallback((region: string) => {
    const isDeselect = selectedRegion === region
    const newRegion = isDeselect ? null : region

    setSelectedRegion(newRegion)

    MutableStoreManager.getInstance().updateStateValue(props.id, 'selectedRegion', newRegion)

    MessageManager.getInstance().publishMessage(
      new DataRecordSetChangeMessage(props.id, isDeselect ? RecordSetChangeType.Remove : RecordSetChangeType.Update, null)
    )
  }, [selectedRegion, props.id])

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)

    try {
      const result = await queryFeatureLayer({
        where: "REGION_DES IS NOT NULL AND REGION_DES <> ''",
        outStatistics: [{
          statisticType: 'count',
          onStatisticField: 'OBJECTID',
          outStatisticFieldName: 'cnt'
        }],
        groupByFieldsForStatistics: ['REGION_DES']
      })

      if (!mountedRef.current) return

      const data: RegionData[] = result.features
        .map((f) => ({
          region: String(f.attributes.REGION_DES || ''),
          count: Number(f.attributes.cnt || 0)
        }))
        .filter((d) => d.region)
        .sort((a, b) => b.count - a.count)

      setRegions(data)
      setLoading(false)
    } catch (err) {
      console.error('Region fetch failed:', err)
      if (mountedRef.current) {
        setError(true)
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    load()
    return () => { mountedRef.current = false }
  }, [load])

  if (loading) {
    return (
      <section className="jimu-widget widget-mine-region-breakdown" role="region" aria-label="Regional office breakdown">
        <h2 className="sr-only">DMP Regional Office Breakdown</h2>
        <p style={{ padding: '8px', fontSize: '12px' }} aria-busy="true">Loading...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="jimu-widget widget-mine-region-breakdown" role="region" aria-label="Regional office breakdown">
        <h2 className="sr-only">DMP Regional Office Breakdown</h2>
        <p style={{ padding: '8px', fontSize: '12px', color: 'var(--calcite-color-status-danger)' }}>
          Failed to load data.{' '}
          <button
            className="retry-btn"
            onClick={load}
            aria-label="Retry loading regional breakdown"
            title="Retry loading regional breakdown"
          >
            Retry
          </button>
        </p>
      </section>
    )
  }

  const totalPermits = regions.reduce((s, r) => s + r.count, 0)

  return (
    <section className="jimu-widget widget-mine-region-breakdown" role="region" aria-label="Regional office breakdown">
      <h2 className="sr-only">DMP Regional Office Breakdown</h2>
      <div role="list" aria-label={`${regions.length} regional offices, ${totalPermits.toLocaleString()} total permits`}>
        {regions.map((r) => (
          <div
            key={r.region}
            className={`region-row${selectedRegion === r.region ? ' region-row--selected' : ''}`}
            role="listitem"
            tabIndex={0}
            aria-label={`${titleCase(r.region)}: ${r.count.toLocaleString()} permits${selectedRegion === r.region ? ', selected' : ''}`}
            aria-selected={selectedRegion === r.region}
            title={`${titleCase(r.region)}: ${r.count.toLocaleString()} permits — click to filter`}
            onClick={() => handleRowClick(r.region)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleRowClick(r.region) } }}
          >
            <span className="region-row__name">{titleCase(r.region)}</span>
            <span className="region-row__count">{r.count.toLocaleString()} permits</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Widget
