# CLI reference — `td` (Todoist) and `obsidian`

Exact command shapes this skill relies on. Prefer `--json` / `format=json` for
anything you need to parse; the default output is human-formatted and may change.

## Slugging

A project's Todoist slug is derived from its display title:

- lowercase
- every run of non-alphanumeric characters → a single `-`
- trim leading/trailing `-`

`Camper Solar Build` → `camper-solar-build`. The `new-project.sh` script and the
note's ` ```todoist ` filter (`filter: "#<slug>"`) both use this rule — keep them
in sync.

## `td` — Todoist

```bash
# Projects
td project list --json                   # { "results": [ {id,name,...} ], "nextCursor" }
td project view "<slug>" [--json]        # details; nonzero exit if missing
td project create --name "<slug>" [--parent "<name>"] [-q]   # prints new id
td project archive "<slug>"              # on completion (prints the id)
td project delete "id:<id>" --yes        # permanent; needs --yes; use id: (see notes)
td project progress "<slug>"             # % complete
td project health "<slug>"               # health status + recommendations

# Tasks
td task add "<content>" --project "<slug>" \
    [--due "<natural date>"] [--priority p1|p2|p3|p4] \
    [--labels "a,b"] [--section "<name>"] [--parent "<ref>"] \
    [--description "<text>"] [--json]
td task list --project "<slug>" [--json | --ndjson]   # open tasks in a project
td task delete <id> --yes                # needs --yes to confirm
td today                                 # tasks due today + overdue
td upcoming [N]                          # due in next N days (default 7)
```

Notes:
- **`--json` for lists nests under `results`** — parse `d["results"]`, not the
  top-level object. `td project list --json` → `{"results": [...], "nextCursor"}`.
- `--due` is passed verbatim as Todoist's `due_string`; simple natural language
  works (`tomorrow`, `2026-06-01`, `every Monday`), complex clauses may not.
- `td` accepts a project by **name/slug or `id:xxx`**. Use the slug for
  human-readable calls; capture the id from `--json`/create output when you need
  stability.
- **Destructive commands need `--yes`**: `td task delete` and `td project delete`
  will refuse without it.
- **Deleting an archived project needs the `id:` ref** — once archived, the slug
  no longer resolves by name (`PROJECT_NOT_FOUND`). Capture the id before/at
  archive time (`td project archive` prints it) and delete with `id:<id> --yes`.
  A project must have **no uncompleted tasks** before it can be deleted.

## `obsidian` — vault operations

Files resolve **by name like a wikilink** (`file=`) or by **exact path**
(`path=`). Quote values with spaces: `name="My Note"`. Target a vault with
`vault=<name>` if more than one is open.

```bash
# Read / find
obsidian files folder=800-Projects [ext=md] [total]
obsidian search:context query="<text>" path=800-Projects format=json [limit=N]
obsidian read path="800-Projects/<Name>.md"
obsidian property:read path="<path>" name=topics
obsidian backlinks file="<Name>" format=json

# Create / edit
obsidian create name="<Name>" path="800-Projects/<Name>.md" \
    content="<text>" [template=<name>] [overwrite]
obsidian append path="<path>" content="<text>"      # e.g. a Log line
obsidian prepend path="<path>" content="<text>"
obsidian property:set path="<path>" name=topics value="<Topic>"
obsidian move path="<old path>" to="<new path>"     # relocate, e.g. into 999-Archive/
obsidian rename path="<path>" name="<New Name>"
obsidian delete path="<path>" [permanent]           # trash, or permanent
```

Notes:
- **Never touch vault files with raw `rm`/`mv`/`cat >` when Obsidian is running
  with Sync on.** Filesystem writes race with the live app and Sync spawns
  numbered conflict copies (`Note 2.md`, `Note 3.md`, …) that then propagate.
  Always mutate through the `obsidian` CLI (`create`, `move to=`, `delete`,
  `append`) so the app and Sync stay coherent. The one exception is the bundled
  `new-project.sh`, which writes a *brand-new* note that doesn't yet exist.
- `obsidian move` uses `to=<new path>` for the destination.
- Use `\n` / `\t` inside `content=` for newlines/tabs.
- When writing note **body** content, honor the vault's inline-tag rule: escape
  non-whitelisted inline hashtags as `\#tag` (whitelisted bare tags: `#daily`,
  `#goals`, `#lesson`, `#home`, `#read`, `#win`). The `#<slug>` inside a
  ` ```todoist ` block is a query filter, not an inline tag — leave it unescaped.
- `move` into `999-Archive/` is the completion step; pair it with
  `td project archive "<slug>"`.
