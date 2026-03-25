import { React, type AllWidgetProps } from 'jimu-core'
import { type IMConfig } from '../../config'
import './style.css'

const { useState, useEffect } = React

const SPLASH_DURATION = 4000

/**
 * Splash Screen widget — fullscreen overlay with EEC logo,
 * title, and description. Fades out after SPLASH_DURATION ms.
 */
const Widget = (props: AllWidgetProps<IMConfig>): React.JSX.Element | null => {
  const [visible, setVisible] = useState(true)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setVisible(false)
    }, SPLASH_DURATION)

    const removeTimer = setTimeout(() => {
      setHidden(true)
    }, SPLASH_DURATION + 800)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (hidden) return null

  return (
    <div
      className={`splash-overlay${visible ? '' : ' splash-overlay--hidden'}`}
      role="status"
      aria-label="Loading Kentucky Mine Permits Dashboard"
      aria-live="polite"
    >
      <img
        className="splash-logo"
        src={`${props.context?.folderUrl ?? ''}dist/runtime/eec-logo.svg`}
        alt="Energy and Environment Cabinet logo"
      />
      <h1 className="splash-title">Kentucky Mine Permits Dashboard</h1>
      <p className="splash-description">
        Explore Kentucky's permitted coal mine boundaries — active, inactive,
        and historic. Analyze permit data across counties with interactive maps,
        charts, and cross-filtered analytics.
      </p>
      <span className="splash-credit">
        Energy and Environment Cabinet — Division of Mine Permits
      </span>
      <div className="splash-loader" aria-hidden="true" />
    </div>
  )
}

export default Widget
