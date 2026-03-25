import { React, type AllWidgetProps, MessageManager, DataRecordSetChangeMessage, RecordSetChangeType, MutableStoreManager } from 'jimu-core'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { type IMConfig } from '../../config'
import { MINE_STATU_GROUPS, STATU_CODE_TO_GROUP } from '../../../../shared-code/mine-statu-groups'
import { queryFeatureLayer } from '../../../../shared-code/direct-query'
import './style.css'

const { useState, useEffect, useCallback, useRef } = React

interface ChartDatum {
  group: string
  count: number
  color: string
  key: string
  codes: string[]
}

/**
 * Mine Status Chart widget — horizontal bar chart of MINE_STATU groups.
 */
const Widget = (props: AllWidgetProps<IMConfig>): React.JSX.Element => {
  const [chartData, setChartData] = useState<ChartDatum[]>([])
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const mountedRef = useRef(true)

  /** Handle bar click — toggle selection and publish cross-filter */
  const handleBarClick = useCallback((data: ChartDatum) => {
    const isDeselect = selectedGroup === data.key
    const newGroup = isDeselect ? null : data.key

    setSelectedGroup(newGroup)

    MutableStoreManager.getInstance().updateStateValue(props.id, 'selectedMineStatuGroup', newGroup)
    MutableStoreManager.getInstance().updateStateValue(props.id, 'selectedMineStatuCodes', isDeselect ? null : data.codes)

    MessageManager.getInstance().publishMessage(
      new DataRecordSetChangeMessage(props.id, isDeselect ? RecordSetChangeType.Remove : RecordSetChangeType.Update, null)
    )
  }, [selectedGroup, props.id])

  /** Fetch MINE_STATU statistics */
  const load = useCallback(async () => {
    setError(false)
    setLoading(true)

    try {
      const result = await queryFeatureLayer({
        outStatistics: [{
          statisticType: 'count',
          onStatisticField: 'OBJECTID',
          outStatisticFieldName: 'cnt'
        }],
        groupByFieldsForStatistics: ['MINE_STATU']
      })

      if (!mountedRef.current) return

      // Aggregate into groups
      const groupCounts: Record<string, number> = {}
      for (const g of MINE_STATU_GROUPS) groupCounts[g.key] = 0

      for (const f of result.features) {
        const code = String(f.attributes.MINE_STATU ?? '')
        const groupKey = STATU_CODE_TO_GROUP[code] ?? 'unknown'
        groupCounts[groupKey] = (groupCounts[groupKey] ?? 0) + Number(f.attributes.cnt || 0)
      }

      const data: ChartDatum[] = MINE_STATU_GROUPS.map((g) => ({
        group: g.label,
        count: groupCounts[g.key] ?? 0,
        color: g.color,
        key: g.key,
        codes: g.codes
      }))

      setChartData(data)
      setLoading(false)
    } catch (err) {
      console.error('MINE_STATU fetch failed:', err)
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
      <section className="jimu-widget widget-mine-statu-chart" role="region" aria-label="Permit status chart">
        <h2 className="sr-only">Permit Status Distribution</h2>
        <p style={{ padding: '8px', fontSize: '12px', color: 'var(--calcite-color-status-danger)' }}>
          Failed to load chart.{' '}
          <button
            className="retry-btn"
            onClick={load}
            aria-label="Retry loading status chart"
            title="Retry loading status chart"
          >
            Retry
          </button>
        </p>
      </section>
    )
  }

  if (loading) {
    return (
      <section className="jimu-widget widget-mine-statu-chart" role="region" aria-label="Permit status chart">
        <h2 className="sr-only">Permit Status Distribution</h2>
        <p style={{ padding: '8px', fontSize: '12px' }} aria-busy="true">Loading...</p>
      </section>
    )
  }

  const totalPermits = chartData.reduce((s, d) => s + d.count, 0)

  return (
    <section
      className="jimu-widget widget-mine-statu-chart chart-container"
      role="region"
      aria-label="Permit status chart"
    >
      <h2 className="sr-only">Permit Status Distribution</h2>
      <div
        role="img"
        aria-label={`Mine status distribution: ${totalPermits.toLocaleString()} total permits across ${chartData.length} categories`}
        title="Mine permit status distribution — click a bar to filter"
      >
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
            <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--calcite-color-text-2)' }} />
            <YAxis type="category" dataKey="group" width={110} tick={{ fontSize: 12, fill: 'var(--calcite-color-text-1)' }} />
            <Tooltip formatter={(value: number) => value.toLocaleString()} />
            <Bar dataKey="count" style={{ cursor: 'pointer' }} onClick={(_data: unknown, index: number) => handleBarClick(chartData[index])} label={{ position: 'right', fontSize: 12, fill: 'var(--calcite-color-text-1)', formatter: (v: number) => v.toLocaleString() }}>
              {chartData.map((d) => (
                <Cell key={d.key} fill={d.color} stroke={selectedGroup === d.key ? 'var(--calcite-color-brand)' : 'none'} strokeWidth={selectedGroup === d.key ? 2 : 0} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Accessible data table for screen readers */}
      <table className="sr-only" aria-label="Mine status counts">
        <thead>
          <tr><th scope="col">Status Group</th><th scope="col">Count</th></tr>
        </thead>
        <tbody>
          {chartData.map((d) => (
            <tr key={d.key}><td>{d.group}</td><td>{d.count.toLocaleString()}</td></tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default Widget
