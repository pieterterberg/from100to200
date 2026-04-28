# Example input — raw git log between v1.3 and v1.4

```
a1b2c3d feat(billing): add idempotency keys to all payment retries (#412)
e4f5g6h fix(billing): prevent double-charge when stripe webhook arrives twice (#414)
i7j8k9l feat(dashboard): add CSV export for all report tables (#418)
m0n1o2p feat(dashboard): keyboard shortcut J/K for navigating rows (#419)
q3r4s5t perf(api): cache /v1/projects responses for 60s, p95 down 340ms→90ms (#421)
u6v7w8x chore: bump postgres driver to 5.2.0 (#422)
y9z0a1b chore: rename internal class FooBar to BillingService
c2d3e4f docs: fix typo in README
g5h6i7j fix(auth): expired session redirects to login instead of 500 (#427)
k8l9m0n feat(api): new endpoint POST /v1/projects/import for bulk import (#430)
o1p2q3r BREAKING: deprecate POST /v1/legacy_projects, will remove in v2.0 (#432)
```

User says: "Write release notes for v1.4. Two versions: end-users and developers."
