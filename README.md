# cldn-marketplace

Chris Lee's personal [Claude Code](https://code.claude.com/docs) plugin
marketplace. Hosts personal skills as installable plugins.

## Install

```text
/plugin marketplace add chrisleedotninja/cldn-marketplace
/plugin install cldn-skills@cldn-marketplace
/reload-plugins
```

Then invoke a skill, e.g. `/cldn-skills:example-skill`.

To pick up later updates:

```text
/plugin marketplace update cldn-marketplace
```

## Structure

```
cldn-marketplace/
├── .claude-plugin/
│   └── marketplace.json        # marketplace catalog (lists plugins)
└── plugins/
    └── cldn-skills/            # a plugin
        ├── .claude-plugin/
        │   └── plugin.json     # plugin manifest
        ├── skills/
        │   └── <skill-name>/
        │       └── SKILL.md    # one directory per skill
        └── README.md
```

- **Marketplace** (`.claude-plugin/marketplace.json`) — the catalog at the repo
  root. Each entry points at a plugin under `plugins/`.
- **Plugin** (`plugins/<name>/.claude-plugin/plugin.json`) — a bundle of skills
  (and optionally agents, commands, hooks). Skills are namespaced as
  `/<plugin>:<skill>`.
- **Skill** (`skills/<name>/SKILL.md`) — a single capability with YAML
  frontmatter and Markdown instructions.

## Adding a new plugin

1. Create `plugins/<new-plugin>/.claude-plugin/plugin.json`.
2. Add an entry to the `plugins` array in `.claude-plugin/marketplace.json`
   with `"source": "./plugins/<new-plugin>"` (a relative path from the repo
   root).
3. Add skills under `plugins/<new-plugin>/skills/`.

## Adding a new skill

See [`plugins/cldn-skills/README.md`](plugins/cldn-skills/README.md).

## Versioning

Each plugin carries an explicit `version`. Bump it (in both `plugin.json` and
the matching marketplace entry) when you want installed users to receive an
update; otherwise they stay pinned to their installed version.

## References

- [Plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)
- [Create plugins](https://code.claude.com/docs/en/plugins)
- [Skills](https://code.claude.com/docs/en/skills)
