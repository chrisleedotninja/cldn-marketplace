# README craft: principles and judgment calls

Read this for the *why* behind the templates and for decisions the templates don't settle. These principles are synthesized from long-standing community writing on READMEs (Art of README, Readme Driven Development, thoughtbot, and others). Apply them with judgment, not as rigid law.

## The two anchors (recap)

- **Cognitive funneling.** Broad → specific ordering, so a reader can pattern-match fast and bail early if it's not a fit. Order sections by how quickly they let someone "short-circuit." Letting a reader leave quickly is a service, not a loss.
- **Show, don't tell.** A runnable example (or a demo for visual projects) does more than prose. Get the reader to a concrete "I see how this works" moment as early as possible. Good documentation keeps the reader *out* of the source code — if they have to read your code to use your project, the README failed.

## Write it first (when starting a project)

If the user is creating a new project (not just documenting a finished one), writing the README *before* the code is a powerful design tool. It forces you to think through the public interface and what the thing actually is, before sinking effort into implementation, and it's far easier to write while motivation is high than to backfill later. Offer this framing when relevant.

## Badge discipline

Badges are easy to abuse and quickly become visual noise. For each badge, ask: *what real value does this give a typical reader?* Build/version/coverage badges carry a genuine signal. A wall of a dozen badges signals insecurity, not quality.

If you do use several:
- No more than ~5 per line; separate groups with a blank line.
- Group by logical category (CI/coverage/quality on one line; community/version/downloads on another).
- Keep every badge in a line the same visual height — a mismatched-height badge gets its own line.

A minimalist library is often best served by two or three badges total. A large framework can justify more, grouped well.

## Inline what's essential; link the rest

Two opposing pulls, both true:

- **Inline anything critical to understanding**, because the repo and its README outlive the hosts and links you point to — especially images. Don't make essential meaning depend solely on an image that may 404, or on an external page.
- **Link, don't duplicate, the deep detail.** A README you have to keep in sync with auto-generated API docs or a docs site will rot. Put exhaustive reference elsewhere and link to it; keep the README high-level. "As short as it can be without being shorter."

The resolution: the *essence* (what it is, how to start, a working example) lives in the README itself; the *encyclopedia* (full API, every config flag, tutorials) lives in linked docs.

## Writing tone

Technical writing is still writing. It need not be dry. A well-crafted opening sentence earns attention; bold emphasis highlights the key claim; links to related projects and term definitions help the reader. Make the reader the subject, not yourself — they're here to find out if your project solves their problem, not to read about you. Skip the philosophy essays and autobiography; that's what a blog is for.

Surface known pain up front: if there's a notorious dependency or a common install gotcha, give the fix in its own short section rather than letting every user rediscover it in the issue tracker.

## The single most valuable line

The one-line description is reused everywhere your project appears — search results, GitHub's trending and topic lists, social cards. In those contexts it's often the *only* text a potential visitor sees before deciding to click. It's worth disproportionate effort: make it the best single sentence describing what the project is and why it matters. Avoid making it just a longer restatement of the title.

## Contested choices (decide deliberately)

The community genuinely disagrees on a few things. Don't blindly maximize sections, and don't blindly minimize either — make a deliberate call based on the project and audience.

- **License in the README.** One camp says GitHub already detects `LICENSE`, so a license section is noise; another (and common practice) wants at least a one-line statement in the README so readers don't have to hunt. *Default:* include a short license line — it's cheap and readers screen on it fast. Use judgment for ultra-minimal READMEs.

- **Contributor list in the README.** GitHub has a contributors tab, so reproducing it can be redundant. *Default:* skip a raw contributor wall for small projects; include an **Acknowledgements** section when you want to credit specific people with their links, or a contributors widget for large community projects where it's a credibility signal.

- **Changelog in the README.** Most projects are better served by the Releases tab than an in-README changelog that grows unbounded. *Default:* use Releases; link to it rather than embedding a changelog.

- **Table of contents.** Pure overhead for a short README; genuinely helpful for a long one. *Default:* add a TOC only when the document is long enough that a reader would otherwise scroll to navigate.

The meta-principle: every section should earn its place by serving the reader. When in doubt, cut.

## Common failure modes to avoid

- No description — the reader can't tell what the project is or why to care.
- Burying the working example below walls of prose or full API reference.
- Badge soup at the top.
- Duplicating docs that live elsewhere (and will drift out of sync).
- Writing about yourself or the project's history instead of the reader's needs.
- Inventing install commands, flags, or claims. If a fact can't be verified from the project's files, ask rather than guess — a confident wrong command destroys trust instantly.
