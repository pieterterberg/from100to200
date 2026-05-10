// netlify/functions/track.js
//
// Tiny visit tracker. Returns a 1x1 transparent PNG for use as an <img> pixel.
// Logs the visit metadata to console (Netlify Function logs, retained ~24h
// on free plan). Pieter can fetch via `netlify functions:log track` from
// the Netlify CLI, or paste from the dashboard.
//
// Query params:
//   p — page identifier (e.g. "skills-patterns"). Optional; defaults to "?".

// 1x1 transparent PNG (43 bytes)
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=',
  'base64'
);

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const headers = {};
  for (const [k, v] of Object.entries(event.headers || {})) headers[k.toLowerCase()] = v;

  const visit = {
    ts: new Date().toISOString(),
    page: (params.p || '?').slice(0, 64),
    ref: (headers['referer'] || params.r || '').slice(0, 200),
    ua: (headers['user-agent'] || '').slice(0, 200),
    ip: headers['x-nf-client-connection-ip'] || headers['x-forwarded-for'] || '?',
    country: headers['x-country'] || headers['cf-ipcountry'] || '?',
  };
  const ua = visit.ua.toLowerCase();
  visit.bot =
    ua.includes('bot') ||
    ua.includes('crawler') ||
    ua.includes('spider') ||
    ua.includes('slurp') ||
    ua.includes('preview') ||
    ua.includes('headlesschrome');

  // Single-line JSON for easy log parsing
  console.log(`[track] ${JSON.stringify(visit)}`);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
    body: PIXEL.toString('base64'),
    isBase64Encoded: true,
  };
};
