---
name: plaud-router
description: Process, triage, and route Plaud voice notes / recordings / transcripts into the right destination — create Todoist tasks, file notes into an Obsidian vault, and add events to Google Calendar. Use when the user says things like "process my Plaud voice notes," "route my recordings," "sort my Plaud transcripts," "turn my voice memos into tasks/notes/events," or otherwise wants captured audio from Plaud sorted into Todoist, Obsidian, and Calendar. Covers the list/diff/fetch → classify → act → record pipeline that downstream slices extend.
---

# Plaud Router

Turn raw Plaud voice notes into the right artifact in the right place: actionable
items become Todoist tasks, ideas and meeting notes land in an Obsidian vault, and
anything time-bound becomes a Google Calendar event. This skill is the contract
for that flow; the ingest, classify, and route slices fill in each stage's detail.

## Pipeline overview

The router moves each recording through four stages, in order. This document names
the stages only — per-stage behavior is defined in later sections and reference
docs.

1. **list / diff / fetch** — enumerate available Plaud recordings, diff them
   against what has already been processed (via the state file), and fetch the
   transcript for anything new.
2. **classify** — decide what each new recording is (task, idea, meeting note,
   calendar event, or inbox catch-all) using the tunable classification rubric.
3. **act** — perform the destination action: create the Todoist task, write the
   Obsidian note, or add the Calendar event.
4. **record** — append the recording's id and outcome to the state file so the
   next run skips it (idempotency).

## Classification

Stage 2 decides **what each new recording is** and therefore where it should go.
There are five locked categories. Each recording is examined and assigned to one
(or more — see *Multi-label*) of them:

| Category  | Distinguishing cue | Short example | Destination |
| --------- | ------------------ | ------------- | ----------- |
| `todo`    | States a concrete **personal** action or deadline the speaker intends to do. | "Remind me to renew the car insurance before Friday." | Todoist task (personal todos only). |
| `meeting` | Recaps a conversation **with other people** — decisions made, who said what, follow-ups. | "Synced with Dana and Raj; we agreed to ship the beta next sprint, I'll draft the changelog." | Obsidian meeting note (summary + decisions + action items as `- [ ]` checkboxes). |
| `idea`    | Captures a thought, concept, or insight with no immediate action. | "What if onboarding had a guided first-run tour?" | Obsidian idea note (cleaned-up idea + summary). |
| `event`   | Names a **date/time to be somewhere** or a scheduled commitment. | "Dentist appointment next Tuesday at 3pm." | Google Calendar event. |
| `inbox`   | Anything the classifier is **not confident** about — the low-confidence fallback. | "...mumbled, half-finished thought that fits nothing cleanly." | Obsidian inbox note for manual triage. |

### How classification is decided

Classification is **LLM-driven from the transcript content alone**. Plaud exposes
**no recording "type" field** — there is no metadata flag that tells you whether a
recording is a todo, a meeting, an idea, or an event — so the category is inferred
by the LLM reading the transcript (and summary, when available), not looked up.

The LLM applies the **tunable rubric** from the config's `classification.rubric`
block (see `config.template.yaml`). That rubric block is the live, user-editable
copy of the rules; edit it to change how recordings are sorted. The classifier
reads it verbatim, so tuning the rubric tunes the behavior without code changes.

The full, editable rules — every category's cues and examples, the multi-label
rule, the inbox fallback, and the meeting-checkbox rule — live in
`references/classification-rubric.md`. Edit that doc to shape classification
behavior, then mirror the rules into the config's `classification.rubric` block.

### Multi-label assignment

A single recording may belong to **more than one** category (multi-label). For
example, a recording that recaps a meeting *and* states a personal action you
must take maps to both `meeting` and `todo`. Assign every category that genuinely
applies rather than forcing a single choice; the act stage then performs each
destination action in turn.

### Meeting action items stay as checkboxes

Meetings are work-related and tracked elsewhere, so a `meeting` recording's
**action items do NOT become Todoist tasks**. Instead, render each action item as
a markdown checkbox inside the Obsidian meeting note:

```markdown
## Action items
- [ ] Draft the changelog (owner: me)
- [ ] Follow up with Raj on the beta date
```

Only the `todo` category — personal todos — creates Todoist tasks. A meeting's
follow-ups remain `- [ ]` checkboxes in the note and never go to Todoist.

### Inbox: the low-confidence fallback

When the classifier is **low-confidence** — the transcript does not clearly fit
any of `todo`, `meeting`, `idea`, or `event` — it falls back to `inbox` rather
than guessing. `inbox` is the catch-all so that **no recording is dropped**:
every processed recording lands somewhere a human can triage it later. If
nothing else applies, classify as `inbox`; nothing is silently discarded.



All runtime settings live in a single config file you fill in once. Copy the
bundled template, save it where the skill expects it, and replace every
placeholder with your own values:

```bash
cp config.template.yaml ~/.plaud-router/config.yaml
```

The template `config.template.yaml` (in this skill's directory) documents every
required field with inline notes:

- **Todoist API token** — for creating tasks.
- **Obsidian vault name and target folders** — `ideas`, `meetings`, and `inbox`.
- **Google Calendar id** — the calendar that time-bound items are added to.
- **State-file path** — defaults to `~/.plaud-router/state.json`; tracks which
  recordings have already been processed.
- **Classification rubric** — a tunable prompt/rules block that drives the
  classify stage.

Fill it in once; subsequent runs read the same file. See the inline comments in
`config.template.yaml` for the exact format of each field.

## Ingest (list / diff / fetch)

Stage 1 turns "what does Plaud have?" into "what do I still need to process?" and
pulls the text for the survivors. It runs entirely against the `plaud` CLI, which
emits **plain text, not JSON** — there is no `--json` mode and no machine format,
so every step below parses unstructured console output. There is also no
"new/unprocessed" flag on the API, so newness is something *we* compute by
diffing against the state file (see the next subsection).

### List recent recordings

Enumerate candidates with one of:

```bash
plaud recent --days N   # everything captured in the last N days
plaud today             # just today's recordings
```

Both print a **text** table/list, one recording per line. Each line carries at
least a **recording id** and a **timestamp** (capture time), plus a title/preview.
Because the output is not JSON, you must **parse** it line by line rather than
deserialize it. A robust approach:

- Treat each non-empty, non-header line as one recording.
- Pull the **id** with a token/column match (ids are a stable opaque token —
  match the id-shaped field, don't assume a fixed column index across CLI
  versions).
- Pull the **timestamp** from the date/time field on the same line; normalize it
  (e.g. to ISO 8601) so later stages and the state file can compare capture
  times consistently.
- Skip banner/header/footer lines and any "no recordings" message.

See `references/plaud-cli.md` for each command's exact text-output shape and
field-by-field parsing tips.

### Diff against already-processed ids

Plaud has no "unprocessed" filter, so reduce the listed recordings to genuinely
new ones by **diffing against the state file** at `~/.plaud-router/state.json`.
Read it, collect the set of **processed recording ids**, and **drop** every
listed recording whose id is already in that set — those have been handled on a
previous run. What remains is the work list for this run.

The state file is shared with the **record** stage (stage 4), which writes it;
the ingest stage only reads it. For the diff, the minimum shape you must be able
to read is a lookup of processed ids — for example:

```json
{
  "processed": [
    { "id": "<recording-id>", "processed_at": "<ISO-8601 timestamp>" }
  ]
}
```

Only the **`id`** field is required to perform the diff (membership test:
"is this recording's id already in `processed`?"). The `processed_at` timestamp
is informational and owned by the record stage; do not depend on its presence
when diffing. If the state file does not exist yet (first run), treat the
processed set as empty so every listed recording is considered new.

### Skip not-ready recordings, then fetch the rest

A recording can be listed before Plaud has finished transcribing it. For each
**new** (unprocessed) recording, check transcript availability **before**
fetching:

```bash
plaud file <id>   # prints metadata + availability flags for one recording
```

Parse the `plaud file <id>` text output for the transcript/summary
**availability** flags. If the transcript is **not ready** yet, **skip** that
recording for now — do **not** add its id to the state file, so it is picked up
and **retried on the next run** (a later run, once Plaud has finished
transcribing). Do not block or poll within a single run.

For the recordings that *are* ready, fetch their text:

```bash
plaud transcript <id>   # the full transcript text
plaud summary <id>      # the Plaud-generated summary (fetch as needed)
```

Hand the fetched transcript (and summary, when used) to the **classify** stage.
Only after a recording has been acted on does the **record** stage add its id to
the state file — that is what keeps not-ready-then-skipped recordings eligible
for a future run.

## Routing (act)

Stage 3 takes each classified recording and performs the **destination action**
for every category the classify stage assigned to it. There are five locked
categories and each routes to exactly one destination:

| Category  | Destination | How it is written |
| --------- | ----------- | ----------------- |
| `todo`    | **Todoist** (personal todos only) | `POST https://api.todoist.com/api/v1/tasks` (REST API v1), `Authorization: Bearer <token>`. |
| `meeting` | **Obsidian** meeting note | Markdown note in the vault's `meetings` folder; action items kept as `- [ ]` checkboxes. |
| `idea`    | **Obsidian** idea note | Markdown note in the vault's `ideas` folder. |
| `event`   | **Google Calendar** event | Created via the already-wired **Google Calendar MCP**. |
| `inbox`   | **Obsidian** triage note | Markdown note in the vault's `inbox` folder for later manual triage. |

Because a recording may carry **more than one** label (see *Multi-label
assignment*), the act stage performs each assigned destination action in turn —
a recording labelled both `meeting` and `todo` writes the meeting note *and*
creates the personal Todoist task.

### `todo` → Todoist (REST v1, Bearer, personal only)

Create the task with the Todoist REST API v1:

```bash
curl -X POST "https://api.todoist.com/api/v1/tasks" \
  -H "Authorization: Bearer $TODOIST_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Renew the car insurance", "due_string": "Friday"}'
```

The token is the **personal** Todoist API token from `todoist.api_token` in
`config.template.yaml`. Only the `todo` category — **personal** todos — creates
Todoist tasks; nothing else routes here.

### `event` → Google Calendar

Time-bound recordings become events on the calendar named by `calendar.id` in
`config.template.yaml`, created through the **Google Calendar MCP** that is
already wired into this environment (no extra credentials to manage). Set the
event title from the recording, the start/end from the spoken date/time, and the
description to include the source recording id (see *Duplicate safety*).

### `meeting` → Obsidian meeting note (action items stay as checkboxes)

A `meeting` recording writes a markdown note into the vault's `meetings` folder
(summary + decisions + action items). Its **action items do NOT become Todoist
tasks** — they are work follow-ups tracked in the note itself. Render each one as
a markdown checkbox inside the meeting note and keep it out of Todoist:

```markdown
## Action items
- [ ] Draft the changelog (owner: me)
- [ ] Follow up with Raj on the beta date
```

Only the `todo` category creates Todoist tasks; a meeting's follow-ups stay as
`- [ ]` checkboxes and are deliberately **kept out of Todoist**.

### Obsidian writes (`meeting`, `idea`, `inbox`): CLI primary, direct write fallback

The three Obsidian destinations — `meeting`, `idea`, and `inbox` — all write a
markdown note into the vault named by `obsidian.vault`, into the folder for that
category (`obsidian.folders.meetings` / `.ideas` / `.inbox`). Each has two write
paths:

1. **Primary — the `obsidian` CLI.** When the Obsidian **app is running**, write
   through the `obsidian` CLI; it returns JSON and keeps the live app's index in
   sync. This is the preferred path.

   ```bash
   obsidian create --vault "$VAULT" --path "Ideas/2026-06-21 router retries.md" --content "$BODY"
   ```

2. **Fallback — a direct `.md` vault-file write.** When the **app is closed** (or
   the CLI is unavailable), fall back to writing the `.md` file **directly** into
   the vault folder on disk. This works without the app running and is the safe
   path under Cowork's isolated VM:

   ```bash
   printf '%s' "$BODY" > "$VAULT_DIR/Ideas/2026-06-21 router retries.md"
   ```

Try the CLI **primary** path first; if the app is closed or the CLI errors, use
the direct vault-file-write **fallback**. Both produce the same note with the
same frontmatter (see *Duplicate safety*).

## Duplicate safety

Dedup is **belt-and-suspenders**: two independent layers so that a recording is
never acted on twice, even if one layer fails.

**Layer 1 — the `state.json` of processed ids.** The skill keeps a
`state.json` (at the `state_file` path from `config.template.yaml`, default
`~/.plaud-router/state.json`) listing every recording id it has already
processed. The ingest stage diffs against it and the **record** stage writes to
it, so the normal run skips anything already handled.

**Layer 2 — stamp the Plaud recording id into every artifact.** Independently of
the state file, the source recording id is **stamped into every artifact** the
act stage creates, in all three destination types:

- **Todoist** — the recording id is written into the **task description**.
- **Obsidian** — the recording id is written into the note's **frontmatter** as
  `plaud_id:`:

  ```markdown
  ---
  plaud_id: a1b2c3d4e5
  ---
  ```

- **Google Calendar** — the recording id is written into the Calendar **event
  description** (the event description field).

The two layers are independent on purpose: **even if the `state.json` is ever
lost** or corrupted, the stamped `plaud_id` on each artifact still lets a
recovery scan detect what was already created, so nothing is duplicated.

## Record

Stage 4 closes the idempotency loop. After the act stage has created the
artifacts for a recording, the record step:

1. **Marks the recording id as `processed`** in the `state.json` (the same file
   the ingest stage diffs against), together with **what was created** — the
   destination links and file **paths** (the Todoist task URL/id, the Obsidian
   note path, the Calendar event link) so the outcome is auditable, not just a
   bare id. For example:

   ```json
   {
     "processed": [
       {
         "id": "a1b2c3d4e5",
         "processed_at": "2026-06-21T09:20:00Z",
         "created": {
           "todoist": "https://todoist.com/showTask?id=...",
           "obsidian": "Meetings/2026-06-21 standup.md",
           "calendar": "https://calendar.google.com/event?eid=..."
         }
       }
     ]
   }
   ```

2. **Appends a run log** line for the run — a human-readable record of which
   recordings were processed, what was created (links/paths), and which were
   skipped (e.g. transcript not ready). The run log is **append-only** so each
   run leaves a durable trail.

Only after this record step adds the id does the next run's ingest diff skip the
recording — a recording that was skipped (e.g. not-ready transcript) is
deliberately **not** marked `processed`, so it is retried on a later run.

## Scheduling

The router is **invocation-agnostic** — it behaves identically however it is
started, because each run reads its work list from Plaud and the `state.json`
and the dedup layers make repeated runs safe. The current mode is **manual**
(run it by hand); it can also be driven on a schedule by local `launchd`/`cron`
or by a Cowork scheduled task.

The three modes differ only in reliability and which resources the run can see —
notably, under Cowork's isolated VM the Obsidian CLI is unavailable, so the
**direct vault-file write** is the safe path there. See
`references/scheduling.md` for each mode and its tradeoffs.
