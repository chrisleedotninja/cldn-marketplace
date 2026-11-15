export type Quiet = boolean

declare module 'claude-code' {
  interface PluginState {
    'quiet-transcript': { isQuiet: Quiet }
  }
}
