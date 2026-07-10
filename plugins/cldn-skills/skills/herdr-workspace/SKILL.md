---
name: herdr-workspace
description: Spin up a new herdr workspace/session running a fresh Claude instance at a repo, an aliased folder (e.g. brainstorms), or any explicit path. Use whenever the user wants a new herdr workspace or session opened somewhere with claude launched in it — phrasings like "spin up a new workspace named X in <repo>", "new session called X in ~/some/path", "start a claude session in brainstorms", "open a workspace for <repo>". Requires running inside herdr (HERDR_ENV=1).
argument-hint: "named <label> in <repo|path|alias>"
allowed-tools: "Bash"
---

# herdr-workspace

Create a new herdr workspace, label it, point it at a directory, and launch a
bare `claude` in its root pane — in one shot via herdr's socket CLI.

Parse two things from the request:

- `<label>` — the workspace/session name (what follows "named"/"called"). If no
  explicit label is given, fall back to the basename of the resolved directory.
- `<location>` — where to open it (what follows "in"): a repo name, an alias, or
  an explicit path.

## Step 0 — require herdr

This skill drives the running herdr instance over its local unix socket, which
only works from inside a herdr-managed pane. First check:

```bash
[ "$HERDR_ENV" = "1" ] && echo "in herdr" || echo "NOT in herdr"
```

If it prints `NOT in herdr`, **stop** and tell the user this skill must be run
from inside herdr. Do not proceed.

## Step 1 — resolve the directory (`CWD`)

A `<location>` is **never** resolved against the current pane's cwd. It is always
one of: an absolute path, an alias, or something under `~/work`. Check these in
order and set `CWD`:

### a. Absolute path

If `<location>` starts with `~` or `/`, treat it as a literal absolute path.
Expand `~` and use it directly:

```bash
CWD=$(python3 -c 'import os,sys; print(os.path.expanduser(sys.argv[1]))' "~/.config/foo")
```

### b. Alias (matched on the first path segment)

Otherwise, split `<location>` on `/` and check its **first segment** (plus any
obvious keyword in the request, e.g. "a brainstorm session") against the **alias
map** below. Replace the alias segment with its base directory and append any
remaining path segments unchanged. The `<label>` names the workspace only — it is
**never** turned into a subfolder.

- bare `brainstorms` → `<base>` → `~/brainstorms` (workspace labeled `<label>`)
- `brainstorms/foo` → `<base>/foo` → `~/brainstorms/foo`

**Alias map** — edit this table to add your own mappings:

| Alias        | Base directory   |
|--------------|------------------|
| `brainstorms`| `~/brainstorms`  |

### c. Bare repo name

Otherwise, if `<location>` is a single segment (no `/`), treat it as a repo
directory name under `~/work` (`~/work/<group>/<repo>`) and resolve at depth 2:

```bash
mapfile -t MATCHES < <(find ~/work -maxdepth 2 -type d -name "rain-infra" 2>/dev/null)
printf '%s\n' "${MATCHES[@]}"
```

- **Exactly one match** → `CWD` = that path.
- **No match** → stop; tell the user no repo by that name exists under `~/work`.
- **Multiple matches** → show candidates and ask which one.

### d. Relative path under `~/work`

Otherwise (a multi-segment relative path whose first segment isn't an alias),
resolve it under `~/work`, e.g. `rain/rain-infra` → `~/work/rain/rain-infra`.

## Step 2 — create the directory if it doesn't exist

For the absolute-path (a) and alias (b) cases, `CWD` may not exist yet. If it's
missing, **ask the user before creating it**, then on confirmation:

```bash
mkdir -p "$CWD"
```

For the bare-repo-name case (c), a no-match already stopped in step 1 — don't
create anything. For the relative-`~/work` case (d), the path is expected to
exist; if it's missing, ask before creating (same as a/b) rather than guessing.

## Step 3 — create the labeled workspace at `CWD`

`herdr workspace create` sets the cwd and label in one call and returns the new
root pane id at `result.root_pane.pane_id`:

```bash
ROOT_PANE=$(herdr workspace create --cwd "$CWD" --label "$LABEL" \
  | python3 -c 'import sys,json; print(json.load(sys.stdin)["result"]["root_pane"]["pane_id"])')
echo "$ROOT_PANE"
```

If `workspace create` fails or `ROOT_PANE` is empty, surface the error and stop —
don't launch claude into a pane that doesn't exist.

## Step 4 — launch claude in the root pane

`pane run` sends the command text plus a real Enter, starting a bare claude:

```bash
herdr pane run "$ROOT_PANE" "claude"
```

A bare claude at the prompt, ready for the user to type.

## Step 5 — confirm

Report back in one line: the label, the resolved directory, and that claude is
running in the new workspace's root pane.

## Notes

- Chain steps 1–4 in a single Bash call so shell vars (`CWD`, `LABEL`,
  `ROOT_PANE`) stay in scope — each Bash tool call is a fresh shell.
- herdr ids compact when workspaces/panes close, so never reuse an old
  `pane_id`; always parse the fresh one from the `workspace create` response.
- This creates a *plain* workspace at the directory root — not a git worktree.
  For an isolated worktree, that's `herdr worktree` territory, out of scope here.
- Full socket API reference: https://herdr.dev/docs/socket-api/
