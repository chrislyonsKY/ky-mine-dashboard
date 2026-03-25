import { type ImmutableObject } from 'jimu-core'

export interface Config {
  /** Map widget ID to listen for click events */
  mapWidgetId: string
}

export type IMConfig = ImmutableObject<Config>
