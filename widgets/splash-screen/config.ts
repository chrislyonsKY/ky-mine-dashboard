import { type ImmutableObject } from 'jimu-core'

export interface Config {
  duration: number
}

export type IMConfig = ImmutableObject<Config>
