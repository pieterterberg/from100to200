# Audiences

By default this skill produces a single end-user-facing changelog. If your release has multiple audiences, list them here and the skill will produce one variant per audience.

---

## end-users
- Who: the people who click around in the product.
- Care about: what's new they can do, what's faster, what's no longer broken.
- Don't care about: refactors, dependency upgrades, internal architecture.
- Tone: see `voice.md`.

## developers (if you ship an SDK or API)
- Who: integrators using your API/SDK.
- Care about: breaking changes (loud), new endpoints, deprecations, perf characteristics, type changes.
- Don't care about: marketing copy.
- Format: include version constraints, migration paths, before/after code blocks where useful.

## ops / SREs (rarely needed)
- Care about: runtime behavior, resource changes, deployment-affecting flags.
- Format: terse, actionable, with rollback notes.
