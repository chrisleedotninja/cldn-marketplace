# Scheduling the router

The plaud-router is **invocation-agnostic**: it does the **same thing regardless
of how it is started**. The pipeline (list / diff / fetch → classify → act →
record) reads its work list from Plaud and the `state.json`, so running it by
hand, from `launchd`/`cron`, or as a Cowork scheduled task produces **identical
behavior** — the only differences are reliability and what local resources the
run can see. The dedup layers (state file + stamped `plaud_id`) make repeated and
overlapping invocations safe.

There is no scheduler baked into the skill; pick whichever invocation mode fits.

## Manual (current mode)

Run the router by hand whenever you want to process recent recordings. This is
the **current** mode and the simplest: you trigger the skill, it lists recent
recordings, processes the new ones, and records the run.

- **Tradeoff:** zero setup and full visibility, but it only runs when you
  remember to run it. New recordings sit unprocessed until the next manual run.
- Runs with your **local** environment — the local Todoist token and a directly
  reachable Obsidian vault are both available.

## Local `launchd` / `cron`

Schedule the router to run automatically on your own machine via macOS
**`launchd`** (a `LaunchAgent` plist) or a **`cron`** entry — e.g. every hour or
a few times a day.

- **Tradeoff:** the **most reliable** option for an always-on personal machine.
  Because it runs **locally**, it sees the **local Todoist token** and the
  **local Obsidian vault** directly, so the Obsidian CLI primary path works when
  the app is running and the direct vault-file write works when it is closed.
- Requires your machine to be awake/on at the scheduled time; a laptop that is
  asleep will miss runs until it wakes (launchd will coalesce a missed run).

A `launchd` agent is generally preferred over `cron` on modern macOS (better
handling of missed runs and login sessions).

## Cowork scheduled task

Run the router as a **Cowork** scheduled task when you want it to run without
your local machine being on.

- **Tradeoff / caveat:** Cowork executes in an **isolated VM** (a virtual
  machine separate from your laptop). That VM does **not** have your local
  Obsidian app running, and may not have your local vault mounted the same way —
  so the Obsidian **CLI primary path is not available** there.
- **Safe Obsidian path under Cowork:** use the **direct `.md` vault-file write**
  fallback against the vault folder that is synced into the VM. This works
  without the app running and is the safe write path in the isolated VM. The
  Todoist (HTTP API) and Google Calendar (MCP) routes work normally from the VM.

## Choosing a mode

| Mode | Reliability | Local token + vault | Obsidian path |
| ---- | ----------- | ------------------- | ------------- |
| Manual | On demand only | Yes (local) | CLI primary or direct write |
| `launchd` / `cron` | Highest (machine must be on) | Yes (local) | CLI primary or direct write |
| Cowork | Runs without your machine | Isolated VM | **Direct vault-file write** only |

Whichever you choose, behavior is the same — the differences are reliability and
which Obsidian write path is available.
