# Classification rubric

This is the canonical, editable reference for how the plaud-router **classify**
stage sorts each recording. It is meant to be **tuned**: read it, adjust the cues
and examples to match how you actually capture voice notes, and the classifier's
behavior changes with it. The **live tunable copy** the classifier reads at
runtime is the `classification.rubric` block in `config.template.yaml` (copied to
your `~/.plaud-router/config.yaml`) — keep that block in sync with the rules you
settle on here.

Classification is **LLM-driven from the transcript content alone**. Plaud exposes
no recording "type" field, so the category is inferred from what the recording
says, never looked up from metadata.

## The five categories

Use these exact category names. A single recording may match **more than one**
category (multi-label) — assign every category that genuinely applies.

### `todo`
- **Cue:** states a concrete **personal** action or deadline the speaker intends
  to do.
- **Example:** "Remind me to renew the car insurance before Friday."
- **Destination:** Todoist task. Personal todos only.

### `meeting`
- **Cue:** recaps a conversation **with other people** — decisions, who said
  what, follow-ups.
- **Example:** "Synced with Dana and Raj; we agreed to ship the beta next sprint,
  I'll draft the changelog."
- **Destination:** Obsidian meeting note (summary + decisions + action items).
- **Action items:** rendered as markdown checkboxes inside the note, **not** sent
  to Todoist. For example:

  ```markdown
  ## Action items
  - [ ] Draft the changelog (owner: me)
  - [ ] Follow up with Raj on the beta date
  ```

  Meeting follow-ups stay as `- [ ]` checkboxes and never become Todoist tasks.

### `idea`
- **Cue:** captures a thought, concept, or insight with no immediate action.
- **Example:** "What if onboarding had a guided first-run tour?"
- **Destination:** Obsidian idea note (cleaned-up idea + summary).

### `event`
- **Cue:** names a **date/time to be somewhere** or a scheduled commitment.
- **Example:** "Dentist appointment next Tuesday at 3pm."
- **Destination:** Google Calendar event.

### `inbox`
- **Cue:** the **low-confidence fallback** — the recording does not clearly fit
  any other category.
- **Example:** "...mumbled, half-finished thought that fits nothing cleanly."
- **Destination:** Obsidian inbox note for manual triage.
- **Purpose:** ensures **no recording is dropped**; when in doubt, classify as
  `inbox` rather than guessing.

## How to tune this rubric

1. Edit the cues and examples above to reflect your own phrasing and habits.
2. Copy the equivalent rules into the `classification.rubric` block in your
   `config.yaml` (templated from `config.template.yaml`) — that block is what the
   classifier actually reads at runtime.
3. Re-run the router; the new rules take effect with no code changes.
