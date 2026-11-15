# quiet-transcript

A Claude Code mod that hides tool activity in the transcript. With the mod on, the transcript shows your prompts and Claude's text replies only.

The mod hides these rows:

- Tool call rows (Bash, Read, Edit, MCP tools and others).
- Tool results, including Bash output and file diffs.
- Grouped summary lines such as "Read 3 files".
- Tool progress rows.

Question dialogs stay visible.

## Install

```text
/plugin marketplace add chrisleedotninja/cldn-marketplace
/plugin install quiet-transcript@cldn-marketplace
/reload-plugins
```

## Use

Hiding is on when a session starts. The status line shows `quiet` while hiding is on.

- Run `/quiet off` to show tool output.
- Run `/quiet on` to hide tool output.
- Run `/quiet status off` to remove the `quiet` entry from the status line.
- Run `/quiet status on` to show the `quiet` entry again.
- Run `/quiet` with no argument to see the current state.

The status line entry shows only while hiding is on. `/quiet status off` removes the entry but keeps hiding on.

To see one hidden row without turning hiding off, press ctrl+o. The ctrl+o transcript and `--verbose` always show everything.

The on/off state lasts for the session. A new session starts with hiding on.
