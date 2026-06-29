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

## Configuration

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
