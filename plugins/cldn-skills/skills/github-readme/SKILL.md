---
name: github-readme
description: Write, draft, rewrite, or substantially improve a README file for a code project or GitHub repository. Use this whenever the user wants a README, asks to "document my project/library/CLI/repo," wants to make their repo more approachable or get more stars, or hands over a project and wants a polished front page for it — even if they don't say the word "README" explicitly (e.g. "what should the front page of my repo say," "my project has no docs, help"). Covers libraries, frameworks, applications, CLIs, and tools. Do NOT use for API reference docs, ARCHITECTURE.md, tutorials, or non-project markdown.
---

# Writing a great README

A README is the front door to a project. For most visitors it is the first — and often the only — thing they read before deciding whether to use, trust, or contribute to the work. So the goal is not to document everything; it is to let a visitor decide, as fast as possible, whether this project fits their need, and then get them to a working example.

Two ideas drive every good README and resolve most judgment calls:

1. **Cognitive funneling.** Order content broad → specific. The top holds the most universally relevant information (what it is, what it looks like in action); deeper sections hold detail only a committed reader needs (full API, configuration, internals). A reader should be able to "short-circuit" and bail the moment they realize it's not for them — that's a feature, not a failure. Respecting their time is the whole job.

2. **Show, don't just tell.** A reader who understands code wants to *see* the thing working. A runnable example or a demo (GIF/screenshot for visual projects) is worth paragraphs of prose. Get the reader to "oh, I see how this works" quickly.

Everything else — which sections to include, how many badges, how long to go — follows from serving the reader and matching the project's type.

## Workflow

1. **Gather the project facts — derive from source, never invent.** You can't write a good README from nothing. Collect: the project's name, what it does in one sentence, the language/ecosystem, how it's installed, a minimal working example, the public API or commands, and (if relevant) a demo asset, license, and where docs/help live.

   Follow this order of preference for every fact, especially the API/command surface (the most invention-prone part of a README):
   - **If repo or files are available, read them and derive the facts from source.** Parse `package.json` / `pyproject.toml` / `go.mod` / `Cargo.toml` for name, version, and install; read the entry points and public modules to enumerate the real exported functions, options, defaults, and CLI flags; read any existing docs. The API section should reflect what the code actually exposes, not a plausible guess.
   - **If no source is available, ask the user for the missing facts.** Do not fabricate function names, options, flags, install commands, or capability claims. A confident but wrong API table or install command destroys trust instantly and is far worse than a short clarifying question. It's fine to draft the surrounding structure and leave clearly-labeled gaps for the facts you're waiting on.

2. **Classify the project type** (decision rule below). This determines which template to use and how much to include.

3. **Read the matching template** in `references/`. Each is a real-world-grounded structure with section-by-section guidance, not a fill-in-the-blank form.

4. **Read `references/principles.md`** for the deeper craft (badge discipline, writing tone, what to inline vs. link, the contested choices). Consult it whenever you're unsure about a specific decision.

5. **Draft the README**, then run the self-check at the bottom of this file before delivering.

## Decision rule: what kind of project is this?

The same principles produce very different READMEs depending on the project. Pick the closest archetype; many projects are blends, in which case lean toward the template that matches the *primary* audience.

- **Library / package** → `references/library.md`
  A thing other developers import and call in their own code (npm package, Python library, Go module, Rust crate). The reader is a developer evaluating an API. Lead with a tight description and a runnable usage snippet; the API reference is the heart of the document. Keep it lean — minimalism is a virtue here. *Reference exemplar: `sindresorhus/pageres`.*

- **Framework / large project / platform** → `references/framework.md`
  A big system developers build *on top of* (web framework, ML platform, full application toolkit). The reader needs a fast on-ramp plus reassurance that the project is real and well-supported. More sections are justified (quickstart, philosophy, feature list, many examples, ecosystem/middleware, contributors), but it must still funnel: a newcomer should hit a working "Hello World" fast. *Reference exemplar: `gofiber/fiber`.*

- **Application / CLI / end-user tool** → `references/application.md`
  Something people *run* rather than import (CLI tool, desktop/web app, service). A visual demo does the heaviest lifting — lead with a GIF or screenshot right after the description. Keep the README itself thin and link out to full docs; show features as a scannable list and a few real-world example invocations. *Reference exemplar: `httpie/cli`.*

- **None of these fit cleanly** (config repo, dataset, awesome-list, monorepo, personal project) → use `references/library.md` as the base, drop the API section, and keep the universal essentials (description, what/why, usage or contents, license). Apply the principles directly rather than forcing a template.

## The universal essentials

Regardless of type, almost every good README needs these. The templates show where each goes:

- **Name** — clear and self-explanatory beats clever.
- **One-line description** — what it is, with enough context that a newcomer knows whether to care. This single line also appears in search results and trending lists, so it carries weight far beyond the README itself; make it the best single sentence you can.
- **Usage / a working example** — the reader sees it in action *before* wading into reference detail.
- **Installation** — show it even when it's the standard one-liner; a newcomer may not know it.
- **License** — readers exclude incompatible licenses fast, so don't make them hunt.

Strongly consider, depending on type: a demo (GIF/screenshot), a short feature list, where to get help, contribution guidance, and credits/acknowledgements.

## Output

Write the result to a file named `README.md` (this is what GitHub renders). If the user is iterating in conversation, you can show the markdown inline, but for a deliverable, create the actual file and present it. Write valid GitHub-Flavored Markdown. Inline anything essential to understanding (don't make critical meaning depend on an image that may break), and use fenced code blocks with language hints for syntax highlighting.

## Self-check before delivering

Read the draft once more as a stranger who just landed on the repo, and confirm:

- Within the first screen, is it clear **what this is** and **why I'd want it**?
- Is there a **runnable example or demo** near the top, before deep reference material?
- Does the order **funnel** broad → specific, so a reader can bail early if it's not for them?
- Is every **badge** earning its place, or is there visual noise? (See principles.md — be ruthless.)
- Are **install** steps and a **license** present and findable?
- Did I **invent** any facts (commands, options, versions, claims)? Every fact should be derived from the project's source/files where available, or asked of the user where not — never guessed. Clearly-labeled placeholders are fine; confabulated APIs and install commands are not.
- Is it **as short as it can be without being shorter** — detail pushed to linked docs where appropriate, not padded with prose about myself or the project's history?
