import { type ImmutableObject } from 'jimu-core'

export interface Config {
  /** Data source ID for mine boundaries */
  dataSourceId: string
}

export type IMConfig = ImmutableObject<Config>
