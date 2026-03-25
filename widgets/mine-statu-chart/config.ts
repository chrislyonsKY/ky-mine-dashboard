import { type ImmutableObject } from 'jimu-core'

export interface Config {
  dataSourceId: string
}

export type IMConfig = ImmutableObject<Config>
