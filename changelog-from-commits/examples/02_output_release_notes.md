# Example output — what the skill produces

## For end-users

```markdown
# v1.4 — CSV exports, keyboard nav, and a billing fix you'll never see

_April 27, 2026_

## New
- Export any report table to CSV. Look for the new export button in the top right of every table. (#418)
- Keyboard shortcuts for navigating rows: J for next, K for previous. Works on every list in the app. (#419)

## Better
- Project list pages load in about a quarter of the time they used to (340ms → 90ms at p95). (#421)

## Fixed
- Sessions that expired in the middle of work used to dump you on a 500 error. Now you get the login page, the way it was supposed to work. (#427)
- Closed a rare hole where a flaky network could cause a double-charge on retry. (#412, #414)
```

---

## For developers

```markdown
# v1.4 — API import, /v1/projects cache, deprecation notice

_April 27, 2026_

## New
- `POST /v1/projects/import` — bulk-import projects from a JSON array. Up to 500 projects per call. See API docs for schema. (#430)

## Better
- `GET /v1/projects` is now cached server-side for 60s. p95 dropped from 340ms to 90ms. Cache-Control headers reflect this. (#421)

## Fixed
- All payment retries now use idempotency keys. Webhook delivery duplicates no longer cause duplicate charges. (#412, #414)
- 401 responses on expired sessions instead of 500s. Status code change is the only API-visible effect. (#427)

## Heads up — deprecation
- `POST /v1/legacy_projects` is deprecated this release and will be removed in v2.0. Migrate to `POST /v1/projects`. (#432)

## How to update
- API consumers: no client changes required for v1.4 itself.
- Stop using `/v1/legacy_projects` before v2.0 ships (Q3 2026).
- Postgres driver was bumped to 5.2.0 internally; no impact on API behavior. (#422)
```

---

## Meta block (always emitted alongside the drafts)

<meta>
- Themes covered: billing reliability, dashboard productivity, API perf, deprecation
- Skipped commits (no user impact): y9z0a1b (internal rename), c2d3e4f (docs typo)
- Confidence: high — all commit messages were clear
- Flags for human: confirm the deprecation timeline (v2.0 / Q3 2026) before publishing
</meta>
