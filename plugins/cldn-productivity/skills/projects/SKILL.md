---
name: projects
description: Manage personal projects that live as one-note-per-project in an Obsidian vault (800-Projects/) paired with a matching Todoist project. Use when the user wants to create a new project, add or list tasks for a project, find or look up a project, check a project's status/progress, append notes or log entries, or complete/archive a finished project. Drives the `td` (Todoist) and `obsidian` CLIs and reconciles the two sides by slug. Triggers on phrases like "new project", "start a project", "add a task to <project>", "what's on <project>", "find my <project> project", "which projects do I have", "archive <project>", "mark <project> done".
---

# Projects

Each project exists in two synchronized places:

- an **Obsidian note** in `800-Projects/<Name>.md` (from the project template —
  frontmatter `tags: [project]` + `topics`, sections **Overview / Tasks / Notes /
  Reference / Log**, and a ` ```todoist ` block filtering on `#<slug>`), and
- a **Todoist project** whose name is the note title's **slug**
  (`Camper Solar Build` → `camper-solar-build`).

The slug is the join key between the two sides. Keep them in sync: a note whose
`#<slug>` filter points at a nonexistent Todoist project shows no tasks, and a
Todoist project with no note is invisible in the vault.

Read `references/cli-reference.md` for the exact `td` and `obsidian` command
shapes and the slug rule. Reach for `--json` / `format=json` whenever you need to
parse output.

## Setup expectations

- Both CLIs are on PATH: `td` (Todoist) and `obsidian`.
- The vault defaults to `~/Documents/TheVault`; projects live in `800-Projects/`,
  completed ones move to `999-Archive/`.
- The bundled creator script is at
  `${CLAUDE_PLUGIN_ROOT}/skills/projects/scripts/new-project.sh`. It honors
  `VAULT`, `TD`, and `PARENT` env overrides.

## Operations

### Create a project

Prefer the bundled script (single source of truth for the note shape + slug +
"skip if exists" safety); fall back to direct CLI calls only if the script is
missing or a step needs finer control.

1. Run `${CLAUDE_PLUGIN_ROOT}/skills/projects/scripts/new-project.sh "<Name>" [topic]`.
   It creates the Todoist project (if absent) and writes the note with the
   `#<slug>` filter already filled in.
2. If the user gave **starter tasks**, add them after creation (the script does
   not): `td task add "<content>" --project "<slug>" ...` for each.
3. Confirm back the note path and the `#<slug>` filter.

Fallback (no script): `td project create --name "<slug>"`, then
`obsidian create name="<Name>" path="800-Projects/<Name>.md" content="…"` shaped
like the template, then add any starter tasks. Follow the slug rule exactly so
the note's filter resolves.

### Add tasks to a project

1. Resolve the slug from the project name; verify the Todoist project exists
   (`td project view "<slug>"`). If it doesn't, offer to create the project first
   rather than silently adding to Inbox.
2. `td task add "<content>" --project "<slug>"` with any of `--due`,
   `--priority p1..p4`, `--labels`, `--section`, `--description`.
3. For several tasks, add them one per call. Report what landed where.

The tasks surface automatically in the note's ` ```todoist ` block — no note edit
needed.

### Find a project

Search **both** sides and reconcile by slug:

- Notes: `obsidian files folder=800-Projects` and/or
  `obsidian search:context query="<term>" path=800-Projects format=json`.
- Todoist: `td project list --json` (match the slug or fuzzy-match the name).

Report matches with their note path and Todoist slug. Flag any **drift** — a note
with no matching Todoist project, or vice versa — since that means tasks won't
show up where expected.

### Show project status

Combine both sides into one view:

- Open tasks: `td task list --project "<slug>" --json` (optionally
  `td project progress "<slug>"`).
- Note context: `obsidian read path="800-Projects/<Name>.md"` for
  Overview/Notes/Log.

Summarize: what it's about, what's open (by priority/due), and recent log
entries.

### Append notes / log entries

Keep the note current with `obsidian append` / `prepend`:

- A log line: `obsidian append path="800-Projects/<Name>.md" content="- <M/D/YY> - <what happened>"`.
- Overview/Notes/Reference additions similarly.

When writing body content, **escape non-whitelisted inline hashtags** as `\#tag`
(bare-allowed: `#daily #goals #lesson #home #read #win`). The `#<slug>` inside the
` ```todoist ` block is a filter, not an inline tag — leave it alone.

### Complete / archive a project

The completion lifecycle, in order:

1. Append a closing log line:
   `obsidian append path="800-Projects/<Name>.md" content="- <M/D/YY> - Completed"`.
2. Archive the Todoist project: `td project archive "<slug>"` (this prints the
   project id — keep it if the user later wants a permanent delete, since an
   archived project no longer resolves by slug).
3. Move the note into the archive:
   `obsidian move path="800-Projects/<Name>.md" to="999-Archive/<Name>.md"`.

Confirm all three steps ran; if the Todoist project still has open tasks, surface
that before archiving so nothing is lost.

## Conventions to respect

- **Mutate the vault only through the `obsidian` CLI** (`create`, `move to=`,
  `delete`, `append`), never raw `rm`/`mv`/shell redirects. Obsidian runs with
  Sync live; filesystem writes race with it and spawn numbered conflict copies
  that propagate. The bundled `new-project.sh` is the one exception (it writes a
  new note that doesn't exist yet).
- **One note per active project** in `800-Projects/`; never create new top-level
  folders.
- **Preserve frontmatter** format (`created`, `modified`, `tags`, `topics`) and
  **wiki-link** syntax (`[[Note]]`), never markdown links.
- **Slug is the contract** between note and Todoist project — derive it the same
  way every time (see `references/cli-reference.md`).
- Link a project to an area via the `topics:` frontmatter field, matching a hub
  note in `900-Topics/` when one exists.
