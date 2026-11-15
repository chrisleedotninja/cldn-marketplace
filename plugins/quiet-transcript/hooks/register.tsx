import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

const isQuiet = atom({ plugin: 'quiet-transcript', key: 'isQuiet' } as const, true)
const showStatus = atom({ plugin: 'quiet-transcript', key: 'showStatus' } as const, true)

const HIDDEN = ['ToolUse', 'ToolResult', 'ToolGroup', 'ToolProgress'] as const

const USAGE = 'Usage: /quiet on | /quiet off | /quiet status on | /quiet status off'

// The status line shows `quiet` only while hiding is on and the entry is enabled.
async function syncStatus($: EngineInterface) {
  const isShown = (await read($, isQuiet)) && (await read($, showStatus))
  $.ui.status(isShown ? 'quiet' : undefined)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'quiet',
      description: 'Hide or show tool rows, outputs and diffs in the transcript',
      argumentHint: 'on | off | status on | status off',
    })
    await syncStatus($)

    return next(e)
  })

  on('command.run', { command: 'quiet' }, async ($, e) => {
    const words = e.args.trim().toLowerCase().split(/\s+/).filter(Boolean)

    if (words.length === 1 && (words[0] === 'on' || words[0] === 'off')) {
      const now = words[0] === 'on'
      await update($, isQuiet, () => now)
      await syncStatus($)
      $.ui.invalidate('ui.render')

      return { text: now ? 'Tool output hidden.' : 'Tool output shown.' }
    }

    if (words.length === 2 && words[0] === 'status' && (words[1] === 'on' || words[1] === 'off')) {
      const now = words[1] === 'on'
      await update($, showStatus, () => now)
      await syncStatus($)

      return { text: now ? 'Status line entry shown.' : 'Status line entry hidden.' }
    }

    const quiet = (await read($, isQuiet)) ? 'on' : 'off'
    const status = (await read($, showStatus)) ? 'on' : 'off'

    return { text: `Quiet is ${quiet}. Status line entry is ${status}. ${USAGE}` }
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
