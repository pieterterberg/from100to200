---
name: changelog-from-commits
description: Turn a raw git log into user-facing release notes that humans actually read. Use when the user pastes git log output, asks "write a changelog for this", "draft release notes", "summarize what shipped this sprint", or shares a list of commits / merged PRs and wants a polished announcement. Reads voice.md for tone and audiences.md for who's reading.
---

# Changelog from commits

Drafts polished release notes from raw commit history. Two failure modes this skill is built to avoid: (1) mechanical bullet-by-bullet "what dev wrote in the commit" notes that nobody reads, and (2) marketing fluff that hides the actual changes. Aim is the third thing: a tight, honest, useful note.

## When to trigger

- The user pastes `git log`, `git log --oneline`, GitHub PR titles, or a list of commits.
- The user says: "write release notes", "draft a changelog for v1.4", "summarize what we shipped", "user-facing version of this", "what should we tell users".
- The user says they're shipping a release and asks how to communicate it.

## Workflow

1. **Read `voice.md`** for tone rules (default: warm, plain, second person, no marketing-speak).
2. **Read `audiences.md`** to know which audience(s) to tailor for. Most products have at least two: end-users and devs/integrators. The same release may need two different write-ups.
3. **Group commits into themes.** Skip pure refactor / chore / dependency-bump commits unless they have user impact. Bucket the rest:
   - **New** — features users can now do that they couldn't before.
   - **Better** — existing features improved (perf, UX, reliability).
   - **Fixed** — bugs squashed.
   - **Heads up** — breaking changes, deprecations, things that require user action.
4. **Write each item once, in user language.** Convert "Refactor billing service to use idempotency key" → "Fixed: rare double-charge on retry from flaky networks." Always lead with the user-visible benefit; mention the technical detail only if devs need it.
5. **Cite commit hashes/PR numbers in parentheses.** Keeps the artifact traceable for the team without cluttering the prose.
6. **Add a one-line release headline** at the top — what's the single most important thing in this release. If you can't pick one, the release is too big or too small.
7. **End with a "How to update" line** if action is required. Skip if not.

## Output format

```markdown
# v{{version}} — {{one-line headline}}

_{{date}} · {{words-of-context-if-any}}_

## New
- ... (#PR)

## Better
- ... (#PR)

## Fixed
- ... (#PR)

## Heads up
- ... (#PR)

## How to update
{{or skip if not needed}}
```

If the user says "two versions: end-user and dev", produce both with the same data, different framing.

## Hard rules

- **Never invent a feature.** If a commit message is cryptic, ask the user to clarify or explicitly say `(unclear from commit message — verify before publishing)`.
- **Never list more than 8 items per section.** If you would, the release is doing too much; split into themes or push some to "minor changes" at the bottom.
- **No exclamation marks.** Excitement is in the substance, not the punctuation.
- **No "we're excited to announce"** or any variant. State what shipped.
- **Always cite at least one commit hash/PR per item** — even if it's `(see internal commit a1b2c3d)`.

## Examples

See `examples/01_input_git_log.md` and `examples/02_output_release_notes.md` for an end-to-end demo on a fictional v1.4 release.

## Customization

- `voice.md` — adjust tone (formal/casual, first-person/second-person, technical/non-technical).
- `audiences.md` — define who reads your changelog and what they care about. The skill produces variants per audience listed.
- For repos with conventional-commit messages (`feat:`, `fix:`, `chore:`), the skill auto-buckets faster. No config needed; it just works better.
