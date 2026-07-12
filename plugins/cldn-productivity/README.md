# CLDN Productivity

Personal collection of productivity and workflow skills for Claude Code.

## Skills

| Skill | Description |
|-------|-------------|
| `projects` | Manage personal projects across Obsidian (`800-Projects/`) and Todoist via the `td` and `obsidian` CLIs — create, add/list tasks, find, status, and archive. |

## Adding a skill

1. Create the skill directory:
   ```bash
   mkdir -p skills/<my-skill>
   ```
2. Write `skills/<my-skill>/SKILL.md` with `name`/`description` frontmatter and
   the instruction body.
3. Add a row to the table above.
4. Commit and push. Bump the `version` in both `.claude-plugin/plugin.json` and
   the marketplace entry if you want installed users to pick up the change.

## Layout

```
cldn-productivity/
├── .claude-plugin/
│   └── plugin.json        # plugin manifest
└── skills/
    └── <skill-name>/
        └── SKILL.md       # one directory per skill
```

Components (skills, agents, hooks) live at the plugin root — only `plugin.json`
goes inside `.claude-plugin/`.
