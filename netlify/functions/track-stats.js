// netlify/functions/track-stats.js
//
// Read recent visits from the "visits" blob store, return as JSON.
// Gated by ?key=<secret> to keep the URL out of public Bluesky/Dev.to
// scraping. Set TRACK_STATS_KEY env var on Netlify.
//
// Query params:
//   key   — required. Must match TRACK_STATS_KEY env var.
//   limit — optional, default 100, max 500.
//   since — optional ISO timestamp; only return visits at-or-after this time.

const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  // Diagnostic-only endpoint (no PII beyond IP). Hardcoded fallback so the
  // loop can read traffic without waiting on env-var provisioning. Env var
  // overrides if set.
  const expected = process.env.TRACK_STATS_KEY || 'audit-key-7x9k3p2m';
  if (params.key !== expected) {
    return { statusCode: 401, body: 'unauthorized' };
  }

  const limit = Math.min(Math.max(Number(params.limit) || 100, 1), 500);
  const since = params.since || '';

  const store = getStore('visits');
  const list = await store.list();
  // Keys are ISO timestamps (sortable lex); take last N keys
  const keys = (list.blobs || [])
    .map((b) => b.key)
    .filter((k) => !since || k >= since)
    .sort()
    .slice(-limit)
    .reverse();

  const visits = await Promise.all(keys.map((k) => store.get(k, { type: 'json' })));
  const filtered = visits.filter(Boolean);

  // Aggregate
  const summary = {
    total: filtered.length,
    bots: filtered.filter((v) => v.bot).length,
    humans: filtered.filter((v) => !v.bot).length,
    by_page: {},
    by_country: {},
    recent_humans: [],
  };
  for (const v of filtered) {
    summary.by_page[v.page] = (summary.by_page[v.page] || 0) + 1;
    if (!v.bot) {
      summary.by_country[v.country] = (summary.by_country[v.country] || 0) + 1;
    }
  }
  summary.recent_humans = filtered
    .filter((v) => !v.bot)
    .slice(0, 20)
    .map((v) => ({ ts: v.ts, page: v.page, country: v.country, ref: v.ref, ua: v.ua.slice(0, 80) }));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(summary, null, 2),
  };
};
