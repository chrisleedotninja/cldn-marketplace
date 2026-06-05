# Template: Library / Package

For a thing other developers **import and call** in their own code: npm packages, Python libraries, Go modules, Rust crates, etc. The reader is a developer evaluating an API to drop into their codebase.

**Governing idea:** minimalism. The reader is busy and evaluating many options. Lead with a tight pitch and a runnable snippet, make the API reference excellent, and resist adding sections that don't pull their weight. A library README that's too long is a worse signal than one that's too short. The reference exemplar `sindresorhus/pageres` uses just two badges, no table of contents, and no contributor wall — and is better for it.

## Section order

The order is deliberate — it's the cognitive funnel for a library. Each element is placed by how quickly it lets a reader confirm a fit or bail.

```
# name

[badge] [badge]   ← optional, few, meaningful only

One- or two-sentence description of what it does, with enough context to
know if you care. A concrete capability claim earns trust
("generates 100 screenshots from 10 sites in just over a minute").

## Install
   the install command, in a fenced code block

## Usage
   a minimal, RUNNABLE example — the most important block in the document

## API
   the heart of the reference: every public function/option with
   signatures, types, defaults, and caveats

## Related / Built with   ← optional
## License
```

## Section-by-section guidance

- **Name + description.** Self-explanatory name. The description should define any non-obvious term in the name itself and state what the library does. One paragraph, no headings yet.

- **Badges (optional, restrained).** Only ones a reader actually benefits from — e.g. build status, version, coverage. Two or three is plenty for a library. If you find yourself adding a fifth, ask what value each provides. Visual noise erodes trust; it doesn't build it.

- **Install.** Even if it's just `npm install x` or `pip install x`, show it in a code block. New users to an ecosystem genuinely don't know the convention. Note any non-standard step (system dependency, post-install) right here.

- **Usage.** The single most valuable block. A short, complete, *runnable* example that a reader can paste and see work. Match the idioms a user of this ecosystem expects (async/await, types, etc.). If the library is a handful of stateless functions, a REPL-style session of calls-and-results can communicate better than a script. Consider committing the example as an `example.js`/`example.py` in the repo so it's genuinely runnable.

- **API.** Document every public object, function, option. **Derive this from the source** when it's available — read the exported symbols, signatures, option objects, and defaults rather than inventing a plausible-looking surface; an API table that doesn't match the real code is worse than no table. If the source isn't available, ask the user for the API rather than guessing (you can draft the section with clearly-labeled placeholders while you wait). For each item: signature, parameter types (where not obvious from convention — `cb` is a callback, `n` is a number), return type, defaults, and which params are optional. Make caveats explicit. For an options object, list every accepted key and its default. If a function needs its own example to be clear, give a tiny one — but a function that's hard to explain may be a sign it should be refactored. Aggressively link specialized terms to definitions.

- **Related / Built with (optional).** Link sibling projects, alternatives, or notable things built with the library. Helps the reader place it in the ecosystem.

- **License.** A line at the bottom (or top if non-permissive — a restrictive license is something readers want to know *immediately*).

## What to leave out

Tables of contents (a lean README doesn't need one), contributor walls (GitHub has a tab), changelogs (use Releases), and long motivational prose. If the library is genuinely large or has important background, add a short **Background** section after the description — but keep the default lean.
