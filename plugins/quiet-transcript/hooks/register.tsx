import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

const isQuiet = atom({ plugin: 'quiet-transcript', key: 'isQuiet' } as const, true)

const HIDDEN = ['ToolUse', 'ToolResult', 'ToolGroup', 'ToolProgress'] as const

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'quiet',
      description: 'Hide or show tool rows, outputs and diffs in the transcript',
      argumentHint: 'on | off',
    })
    if (await read($, isQuiet)) {
      $.ui.status('quiet')
    }

    return next(e)
  })

  on('command.run', { command: 'quiet' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()

    if (arg !== 'on' && arg !== 'off') {
      const state = (await read($, isQuiet)) ? 'on' : 'off'

      return { text: `Quiet is ${state}. Usage: /quiet on | /quiet off` }
    }

    const now = arg === 'on'
    await update($, isQuiet, () => now)
    $.ui.status(now ? 'quiet' : undefined)
    $.ui.invalidate('ui.render')

    return { text: now ? 'Tool output hidden.' : 'Tool output shown.' }
  })

  on('ui.render', { component: HIDDEN }, async ($, e, next) => {
    // ctrl+o and --verbose still show everything.
    if ((e.props as { isExpanded?: boolean }).isExpanded) {
      return next(e)
    }
    if (!(await read($, isQuiet))) {
      return next(e)
    }
    const { Box } = $.ui.resolve(e)

    return <Box />
  })
}
