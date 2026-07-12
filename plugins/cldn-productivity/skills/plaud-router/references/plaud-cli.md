# `plaud` CLI reference

The `plaud` CLI is the only interface the router uses to reach Plaud. Two facts
shape everything below:

- **Output is plain text, not JSON.** There is no `--json` / machine mode. Every
  command prints human-readable console text, so the skill must **parse** the
  text rather than deserialize a structured payload.
- **There is no "new/unprocessed" flag and no recording "type" field.** Newness
  is computed by the skill (diff against `~/.plaud-router/state.json`), and
  classification is decided by the rubric — not read off the CLI.

Output shapes shown here are representative; treat exact column widths and label
wording as version-dependent and match on **field shape**, not fixed offsets.

## `plaud login`

**Purpose:** authenticate the CLI against your Plaud account. Run once before any
other command; later commands fail if you are not logged in.

**Output (text):** a short confirmation line (e.g. `Logged in as <account>`) or
an error prompting you to authenticate. Nothing to parse for the pipeline — just
treat a non-error exit as "session ready."

## `plaud recent --days N`

**Purpose:** list every recording captured in the last `N` days. The primary
listing command for the ingest stage.

**Output (text):** one recording per line (often after a header line), each line
carrying a **recording id**, a **capture timestamp**, and a short title/preview:

```text
ID            CAPTURED              TITLE
a1b2c3d4e5    2026-06-21 09:14      Standup notes
f6g7h8i9j0    2026-06-21 17:02      Idea: router retries
```

**Parsing tips:** skip the header and any "no recordings" line; for each data
line, extract the **id** by matching the opaque id-shaped token and the
**timestamp** from the date/time field, then normalize the timestamp (e.g. to
ISO 8601). Do not rely on a fixed column index across CLI versions.

## `plaud today`

**Purpose:** list just today's recordings. Same role as `plaud recent` but scoped
to the current day; useful for a frequent cron-style run.

**Output (text):** identical line shape to `plaud recent` (id + timestamp +
title), limited to today. Parse it the same way.

## `plaud file <id>`

**Purpose:** print metadata and **availability flags** for a single recording.
The ingest stage uses this to decide whether a recording is ready to fetch before
pulling its transcript.

**Output (text):** a labelled key/value block, including whether the transcript
and summary are ready:

```text
ID:          a1b2c3d4e5
Captured:    2026-06-21 09:14
Duration:    00:03:12
Transcript:  ready
Summary:     ready
```

**Parsing tips:** read the **availability** lines (e.g. `Transcript: ready` vs
`Transcript: processing`). If the transcript is **not ready**, skip the recording
this run and retry on a later run. Match the availability label
case-insensitively rather than assuming an exact string.

## `plaud transcript <id>`

**Purpose:** fetch the full transcript text for a recording whose transcript is
ready.

**Output (text):** the transcript body as plain text (no JSON wrapper). Capture
the whole output and hand it to the classify stage.

## `plaud summary <id>`

**Purpose:** fetch the Plaud-generated summary for a recording. Fetch as needed
(e.g. to supplement classification or as the note body).

**Output (text):** the summary body as plain text. As with `transcript`, there is
nothing to deserialize — use the text directly.
