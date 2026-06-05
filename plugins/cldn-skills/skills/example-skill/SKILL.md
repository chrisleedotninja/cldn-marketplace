---
name: example-skill
description: Template skill demonstrating the SKILL.md structure. Replace this with a real skill — copy this directory, rename it, and rewrite the frontmatter and body. Use when you want a starting point for authoring a new skill in this marketplace.
---

# Example Skill

This is a template skill. It shows the minimal structure every skill in this
marketplace follows. To create a real skill:

1. Copy this directory: `cp -r skills/example-skill skills/my-new-skill`
2. Rename it to a `kebab-case` name describing what it does.
3. Rewrite the `name` and `description` frontmatter above. The `description` is
   what Claude reads to decide when to auto-invoke the skill, so lead with the
   concrete trigger conditions and use cases.
4. Replace this body with the actual instructions Claude should follow.

## Authoring notes

- The `description` (plus optional `when_to_use`) is capped at ~1,536 chars
  combined — front-load the most important triggering language.
- Put supporting material (reference docs, scripts, examples) alongside
  `SKILL.md` in this directory; Claude can read or execute them on demand.
- Add `allowed-tools` to the frontmatter to pre-approve specific tools while the
  skill is active, e.g. `allowed-tools: "Read Grep"`.
- Once installed, this skill is invoked as `/cldn-skills:example-skill`.

## Useful frontmatter fields

| Field | Purpose |
|-------|---------|
| `name` | Display name (defaults to the directory name). |
| `description` | What the skill does and when to use it. Drives auto-invocation. |
| `when_to_use` | Extra triggering context appended to `description`. |
| `argument-hint` | Autocomplete hint for `/` invocation, e.g. `"[file]"`. |
| `allowed-tools` | Tools pre-approved while the skill is active. |
| `disable-model-invocation` | `true` = user-only (Claude won't auto-invoke). |
| `model` | Override the session model for this skill. |
| `context: fork` | Run the skill in an isolated subagent. |
