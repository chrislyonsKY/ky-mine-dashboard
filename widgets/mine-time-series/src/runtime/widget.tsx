import { React, type AllWidgetProps } from 'jimu-core'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { type IMConfig } from '../../config'
import { queryFeatureLayer } from '../../../../shared-code/direct-query'
import './style.css'

const { useState, useEffect, useCallback, useRef } = React

interface AcreageDatum {
  label: string
  typeFlag: string
  acres: number
  count: number
  color: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ACT: { label: 'Active', color: '#34d399' },
  INACT: { label: 'Inactive', color: '#f59e0b' },
  RECNF: { label: 'Historic (Pre-SMCRA)', color: '#6b7280' }
}

const STATUS_ORDER = ['ACT', 'INACT', 'RECNF']

/**
 * Format acres to readable string: 1,581,861 → "1.58M" or "159,763"
 */
function formatAcres (acres: number): string {
  if (acres >= 1_000_000) return `${(acres / 1_000_000).toFixed(2)}M`
  if (acres >= 1_000) return `${Math.round(acres).toLocaleString()}`
  return `${acres.toFixed(1)}`
}

/**
 * Custom tooltip showing acreage details
 */
const AcreageTooltip = ({ active, payload }: {
  active?: boolean
  payload?: Array<{ payload: AcreageDatum }>
}): React.JSX.Element | null => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="acreage-tooltip" role="tooltip">
      <div className="acreage-tooltip__title">{d.label}</div>
      <div className="acreage-tooltip__row">{Math.round(d.acres).toLocaleString()} acres</div>
      <div className="acreage-tooltip__row">{d.count.toLocaleString()} permits</div>
      <div className="acreage-tooltip__avg">
        Avg: {d.count > 0 ? Math.round(d.acres / d.count).toLocaleString() : '—'} acres/permit
      </div>
    </div>
  )
}

/**
 * Mine Acreage Chart — horizontal bar chart of total permitted acres by Type_Flag.
 * Uses SUM statistics query on Calc_Acres — no MaxRecordCount limitation.
 */
const Widget = (props: AllWidgetProps<IMConfig>): React.JSX.Element => {
  const [chartData, setChartData] = useState<AcreageDatum[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const mountedRef = useRef(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)

    try {
      const result = await queryFeatureLayer({
        outStatistics: [
          { statisticType: 'sum', onStatisticField: 'Calc_Acres', outStatisticFieldName: 'total_acres' },
          { statisticType: 'count', onStatisticField: 'OBJECTID', outStatisticFieldName: 'cnt' }
        ],
        groupByFieldsForStatistics: ['Type_Flag']
      })

      if (!mountedRef.current) return

      const data: AcreageDatum[] = STATUS_ORDER
        .map((tf) => {
          const feature = result.features.find((f) => String(f.attributes.Type_Flag || '').trim() === tf)
          const cfg = STATUS_CONFIG[tf]
          if (!cfg || !feature) return null
          return {
            label: cfg.label,
            typeFlag: tf,
            acres: Number(feature.attributes.total_acres || 0),
            count: Number(feature.attributes.cnt || 0),
            color: cfg.color
          } satisfies AcreageDatum
        })
        .filter(Boolean) as AcreageDatum[]

      setChartData(data)
      setLoading(false)
    } catch (err) {
      console.error('Acreage fetch failed:', err)
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

  if (error) {
    return (
      <section className="jimu-widget widget-mine-acreage-chart" role="region" aria-label="Permitted acreage">
        <h2 className="acreage-heading">Permitted Acreage by Status</h2>
        <p role="alert" style={{ padding: '8px', fontSize: '12px', color: 'var(--calcite-color-status-danger)' }}>
          Failed to load chart.{' '}
          <button
            className="retry-btn"
            onClick={load}
            aria-label="Retry loading acreage chart"
            title="Retry loading acreage chart"
          >
            Retry
          </button>
        </p>
      </section>
    )
  }

  if (loading) {
    return (
      <section className="jimu-widget widget-mine-acreage-chart" role="region" aria-label="Permitted acreage">
        <h2 className="acreage-heading">Permitted Acreage by Status</h2>
        <p style={{ padding: '8px', fontSize: '12px' }} aria-busy="true">Loading...</p>
      </section>
    )
  }

  const totalAcres = chartData.reduce((s, d) => s + d.acres, 0)

  return (
    <section
      className="jimu-widget widget-mine-acreage-chart chart-container"
      role="region"
      aria-label="Permitted acreage"
    >
      <h2 className="acreage-heading">Permitted Acreage by Status</h2>
      <div className="acreage-total" aria-live="polite">
        {formatAcres(totalAcres)} total acres
      </div>
      <div
        role="img"
        aria-label={`Permitted acreage: ${formatAcres(totalAcres)} total acres across ${chartData.length} categories`}
        title="Permitted acreage by status — hover for details"
      >
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 60 }}>
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: 'var(--calcite-color-text-2)' }}
              tickFormatter={(v: number) => formatAcres(v)}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={100}
              tick={{ fontSize: 12, fill: 'var(--calcite-color-text-1)' }}
            />
            <Tooltip content={<AcreageTooltip />} />
            <Bar
              dataKey="acres"
              label={{
                position: 'right',
                fontSize: 12,
                fill: 'var(--calcite-color-text-1)',
                formatter: (v: number) => formatAcres(v)
              }}
            >
              {chartData.map((d) => (
                <Cell key={d.typeFlag} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Accessible data table for screen readers */}
      <table className="sr-only" aria-label="Permitted acreage by status">
        <thead>
          <tr>
            <th scope="col">Status</th>
            <th scope="col">Total Acres</th>
            <th scope="col">Permits</th>
            <th scope="col">Avg Acres/Permit</th>
          </tr>
        </thead>
        <tbody>
          {chartData.map((d) => (
            <tr key={d.typeFlag}>
              <td>{d.label}</td>
              <td>{Math.round(d.acres).toLocaleString()}</td>
              <td>{d.count.toLocaleString()}</td>
              <td>{d.count > 0 ? Math.round(d.acres / d.count).toLocaleString() : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default Widget
