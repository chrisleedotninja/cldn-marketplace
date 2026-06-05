# Template: Application / CLI / End-User Tool

For something people **run** rather than import: command-line tools, desktop or web apps, services, bots. The reader wants to know what it does and what it looks like in use — often before they care about a single line of code.

**Governing idea:** the demo does the heavy lifting. A short animated GIF or screenshot placed right after the description communicates more, faster, than any paragraph. Then keep the README itself thin and push full documentation to a linked docs site. The reference exemplar `httpie/cli` leads with a one-paragraph description, an animated GIF of the tool in action, a scannable feature list, a few real example invocations, and links out for everything else.

## Section order

```
# Name   [a few badges: version, build, docs, chat]

One short paragraph: what it is, who it's for, and its goal/feel.

[ ANIMATED GIF or SCREENSHOT of the tool in action ]   ← right here, high up

## Getting started / Installation
   install link or commands; for apps, link to the download/docs page

## Features
   a scannable bulleted list of capabilities → "see all features" link

## Examples
   a few real, copy-pasteable invocations showing actual usage

## Community & support
   where to ask questions: docs, chat, issues, etc.

## Contributing
## License
```

## Section-by-section guidance

- **Description.** One paragraph, plainly stated. Say what it is and the experience it aims for ("make CLI interaction with web services as human-friendly as possible"). This line also shows in search and trending lists, so make it strong on its own.

- **The demo.** This is the centerpiece for an application. Place a GIF or screenshot immediately after the description, before anything else. For a CLI, an animated terminal session. For a GUI app, a screenshot or short screen recording. It should show the tool doing its core job. Inline it high; don't bury it below the fold. (Tools for making terminal GIFs: vhs, terminalizer, asciinema; for screen GIFs: LICEcap, ScreenToGif, Gifski.)

- **Getting started / Installation.** For a tool with one install method, show the command. For an app with platform-specific installers or a hosted version, link to the download/docs page rather than reproducing a long matrix in the README.

- **Features.** A scannable bulleted list of what it can do — expressive, one line each — ending with a "see all features →" link to full docs. The list sells; the docs explain.

- **Examples.** A few real invocations a user would actually type, each with a one-line explanation of what it demonstrates, then a link to more. Show the tool's natural syntax and range (a basic case, a more powerful case, an integration). Keep them copy-pasteable.

- **Community & support.** Where to go for help: documentation site, chat/Discord, issue tracker, relevant tag on StackOverflow. Applications attract end users (not just developers), so a clear support path matters more here than for a library.

- **Contributing.** Point to existing issues/PRs to help with and a contribution guide. Keep it brief and link out to `CONTRIBUTING.md`.

- **License.** A clear statement and link.

## Keep it thin

The strong temptation with an application is to put the entire manual in the README. Resist it: the README's job is to convince and orient, not to be the documentation. Lead with the demo, give a taste via features and examples, and link to the real docs for depth. A thin, vivid README outperforms an exhaustive wall of text.
