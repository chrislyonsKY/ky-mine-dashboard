import { React } from 'jimu-core'
import { type AllWidgetSettingProps } from 'jimu-for-builder'
import { DataSourceSelector, AllDataSourceTypes } from 'jimu-ui/advanced/data-source-selector'
import { type IMConfig } from '../../config'

const Setting = (props: AllWidgetSettingProps<IMConfig>): React.JSX.Element => {
  const { useDataSources } = props

  const onToggleUseDataEnabled = (useDataSourcesEnabled: boolean) => {
    props.onSettingChange({
      id: props.id,
      useDataSourcesEnabled
    })
  }

  const onDataSourceChange = (useDataSources: any) => {
    props.onSettingChange({
      id: props.id,
      useDataSources
    })
  }

  return (
    <div className="widget-setting-mine p-2">
      <DataSourceSelector
        types={[AllDataSourceTypes.FeatureLayer] as any}
        useDataSources={useDataSources}
        useDataSourcesEnabled
        onToggleUseDataEnabled={onToggleUseDataEnabled}
        onChange={onDataSourceChange}
        widgetId={props.id}
      />
    </div>
  )
}

export default Setting
