import { React, type AllWidgetProps, MutableStoreManager, MessageManager, ExtentChangeMessage } from 'jimu-core'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis'
import { Button } from 'jimu-ui'
import { type IMConfig } from '../../config'
import { COUNTIES_URL } from '../../../../shared-code/constants'
import './style.css'

const { useState, useCallback, useRef } = React

interface CountyState {
  name: string
  geometry: __esri.Geometry
}

/**
 * County-first navigation widget.
 * Listens for map clicks on the counties layer, captures geometry,
 * writes shared state, and publishes ExtentChangeMessage.
 */
const Widget = (props: AllWidgetProps<IMConfig>): React.JSX.Element => {
  const { id, useMapWidgetIds } = props
  const [selectedCounty, setSelectedCounty] = useState<CountyState | null>(null)
  const [viewState, setViewState] = useState<'statewide' | 'county'>('statewide')
  const jmvRef = useRef<JimuMapView | null>(null)
  const clickHandlerRef = useRef<__esri.Handle | null>(null)

  /** Write shared state so other widgets can read current county/view */
  const updateSharedState = useCallback((county: CountyState | null, state: 'statewide' | 'county') => {
    MutableStoreManager.getInstance().updateStateValue(id, 'selectedCounty', county)
    MutableStoreManager.getInstance().updateStateValue(id, 'viewState', state)
  }, [id])

  /** Handle county click — hit test counties layer, zoom, publish */
  const handleMapClick = useCallback(async (event: __esri.ViewClickEvent, view: __esri.MapView | __esri.SceneView) => {
    try {
      const hitResult = await view.hitTest(event)
      const countyHit = hitResult.results.find(
        (r: __esri.HitTestResult) => 'graphic' in r && r.graphic?.layer?.url?.includes('Counties')
      )

      if (!countyHit || !('graphic' in countyHit)) return

      const graphic = countyHit.graphic
      const countyName = graphic.attributes?.NAME ||
                          graphic.attributes?.NAMELSAD20 ||
                          graphic.attributes?.CountyName ||
                          'Unknown'
      const geometry = graphic.geometry

      if (!geometry) return

      const county: CountyState = { name: countyName, geometry }
      setSelectedCounty(county)
      setViewState('county')
      updateSharedState(county, 'county')

      // Zoom to county
      await view.goTo(geometry.extent.expand(1.2))

      // Publish extent change
      MessageManager.getInstance().publishMessage(
        new ExtentChangeMessage(id, view.extent)
      )
    } catch (err) {
      console.error('County click handler error:', err)
    }
  }, [id, updateSharedState])

  /** Handle active view change — attach click listener */
  const handleActiveViewChange = useCallback((jmv: JimuMapView) => {
    if (!jmv) return
    jmvRef.current = jmv

    // Remove previous click handler
    clickHandlerRef.current?.remove()

    // Attach new click handler
    clickHandlerRef.current = jmv.view.on('click', (event) => {
      handleMapClick(event, jmv.view)
    })

    // Set initial shared state
    updateSharedState(null, 'statewide')
  }, [handleMapClick, updateSharedState])

  /** Return to statewide view */
  const handleBackToStatewide = useCallback(async () => {
    setSelectedCounty(null)
    setViewState('statewide')
    updateSharedState(null, 'statewide')

    const view = jmvRef.current?.view
    if (view) {
      // Zoom back to KY extent
      await view.goTo({
        center: [-85.3, 37.8],
        zoom: 7
      })

      MessageManager.getInstance().publishMessage(
        new ExtentChangeMessage(id, view.extent)
      )
    }
  }, [id, updateSharedState])

  return (
    <nav className="jimu-widget widget-county-navigator" aria-label="County navigation" style={{ width: '100%', height: '100%' }}>
      <h2 className="sr-only">County Navigation</h2>
      {useMapWidgetIds?.[0] && (
        <JimuMapViewComponent
          useMapWidgetId={useMapWidgetIds[0]}
          onActiveViewChange={handleActiveViewChange}
        />
      )}

      {viewState === 'county' && selectedCounty
        ? (
          <>
            <Button
              size="sm"
              type="tertiary"
              onClick={handleBackToStatewide}
              aria-label="Back to statewide view"
              title="Back to statewide view"
            >
              ← Back
            </Button>
            <div>
              <span className="county-nav__label">Viewing</span>{' '}
              <span className="county-nav__name" aria-live="polite">{selectedCounty.name} County</span>
            </div>
          </>
        )
        : (
          <span className="county-nav__label">Click a county to explore mines</span>
        )}
    </nav>
  )
}

export default Widget
