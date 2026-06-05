# CLDN Skills

Personal collection of development and productivity skills for Claude Code.

## Skills

| Skill | Description |
|-------|-------------|
| `example-skill` | Template skill demonstrating the `SKILL.md` structure. |

_Add a row here for each new skill._

## Adding a skill

1. Copy the template:
   ```bash
   cp -r skills/example-skill skills/<my-skill>
   ```
2. Edit `skills/<my-skill>/SKILL.md` — update the `name`/`description`
   frontmatter and rewrite the body.
3. Add a row to the table above.
4. Commit and push. Bump the `version` in both `.claude-plugin/plugin.json` and
   the marketplace entry if you want installed users to pick up the change.

## Layout

```
cldn-skills/
├── .claude-plugin/
│   └── plugin.json        # plugin manifest
└── skills/
    └── <skill-name>/
        └── SKILL.md       # one directory per skill
```

Components (skills, agents, hooks) live at the plugin root — only `plugin.json`
goes inside `.claude-plugin/`.
