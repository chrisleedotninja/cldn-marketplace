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
