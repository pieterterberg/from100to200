// netlify/functions/track.js
//
// Tiny visit tracker. Returns a 1x1 transparent PNG for use as an <img> pixel,
// and writes the visit metadata to a Netlify Blob store ("visits") with a
// timestamped key. Read back via /.netlify/functions/track-stats.
//
// Query params:
//   p — page identifier (e.g. "skills-patterns"). Optional; defaults to "?".

const { getStore } = require('@netlify/blobs');

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

  // Filter obvious bots: prefetchers, link checkers, our own monitoring
  const ua = visit.ua.toLowerCase();
  const isBot =
    ua.includes('bot') ||
    ua.includes('crawler') ||
    ua.includes('spider') ||
    ua.includes('slurp') ||
    ua.includes('preview') ||
    ua.includes('headlesschrome');
  visit.bot = isBot;

  try {
    const store = getStore('visits');
    // Random suffix to avoid collisions on same-millisecond visits
    const key = `${visit.ts}-${Math.random().toString(36).slice(2, 8)}`;
    await store.setJSON(key, visit);
  } catch (e) {
    console.error('[track] blob write failed:', e.message);
  }

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
