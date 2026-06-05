# Template: Framework / Large Project / Platform

For a big system developers **build on top of**: web frameworks, ML/data platforms, application toolkits, large multi-component projects. The reader needs two things at once — a fast on-ramp to start building, *and* reassurance that the project is real, maintained, and worth committing to.

**Governing idea:** more sections are justified here than for a library, but the funnel still rules. The biggest risk is burying the "Hello World" under preamble. A newcomer should reach a working quickstart within the first scroll or two. The reference exemplar `gofiber/fiber` opens with a one-paragraph pitch, then goes straight to Install → Quickstart before any philosophy or feature catalog.

## Section order

```
# Name   [logo and/or a badge or two]

A short, punchy pitch paragraph — what it is and its headline benefit.
Emphasize key claims with bold. Often italicized as a tagline block.

## Installation
   prerequisites + the install command(s)

## Quickstart
   a complete, runnable "Hello World" — the on-ramp. This must come early.

## (Philosophy / Why)        ← short; the motivation and design stance
## Features                  ← scannable bulleted list, each linking to docs
## Examples                  ← several real, copy-pasteable snippets
## (Ecosystem / Middleware / Plugins)   ← tables linking to components
## Contributing / Development
## (Contributors / Supporters / Sponsors)
## License
```

Sections in parentheses are valuable for frameworks specifically; include them when they're real, skip them when they'd be filler.

## Section-by-section guidance

- **Header.** A logo is appropriate for a project of this scale. Badges are fine but still curated — group them logically (CI/coverage/quality on one line; community/version on another) and keep them tidy. The pitch paragraph should grab the reader: state what it is, what it's inspired by or competes with, and the headline benefit, with the key phrases in bold.

- **Installation.** State prerequisites (language version, runtime) before the command, since a version mismatch is a common first failure. Link to the ecosystem's getting-started if a newcomer might need it.

- **Quickstart.** The on-ramp, and it must come early. A complete, runnable minimal program — for a web framework, the route that returns "Hello, World." Walk through what the code does in a sentence or two. The reader should be able to copy it, run it, and see a result. This is where you win or lose them.

- **Philosophy / Why (short).** A few sentences on the motivation and design stance — who it's for, what tradeoff it makes, what existing thing it's modeled on. This builds trust and helps readers self-select. Keep it tight; this is not a blog post.

- **Features.** A scannable bulleted list. Each bullet links to the relevant documentation page rather than explaining in full. The list signals scope; the links carry the detail.

- **Examples.** Several short, real, copy-pasteable snippets covering common tasks (routing, config, middleware, a JSON response, etc.). Each with a one-line label and a link to fuller docs. Breadth here reassures the reader the framework handles their case.

- **Ecosystem / Middleware / Plugins.** For frameworks with many components, a table (name + one-line description + link) is the right format. It conveys the size of the ecosystem at a glance without bloating the prose.

- **Contributing / Development.** Write for a competent newcomer to *this* project, not an expert in your toolchain. How to set up, build, run tests, and what to expect from a PR. Link out to install the tools rather than teaching them. Don't lecture ("first learn Docker") — tell them what to do in this specific repo.

- **Contributors / Supporters / Sponsors.** Justified for a large community project, both as recognition and as a credibility signal. Use auto-generated images/widgets where possible so it stays current.

- **License.** A clear statement and link near the bottom.

## Funnel check specific to frameworks

It's easy to let a framework README sprawl. After drafting, confirm the reader hits a runnable quickstart fast, the feature list links out instead of inlining everything, and deep reference lives in linked docs — not duplicated in the README, which you'd then have to keep in sync.
