// netlify/functions/polar-webhook.js
//
// Receives Polar webhooks (Standard Webhooks / Svix format) and emails Pieter
// via Postmark when something interesting happens:
//
//   - checkout.created  → "👀 Someone started checkout"
//   - order.created     → "💰 SALE — €X.XX"
//   - order.refunded    → "↩️ Refund issued"
//
// Required Netlify env vars:
//   POLAR_WEBHOOK_SECRET   — the `whsec_...` value Polar shows when you
//                            create the webhook endpoint.
//   POSTMARK_TOKEN         — same token Pieter uses elsewhere
//                            (in credentials.md).
//   NOTIFY_EMAIL           — where to send the alert. Defaults to
//                            from100to200@terberg.fi.
//
// Polar webhook URL to register:
//   https://from100to200.com/.netlify/functions/polar-webhook

const crypto = require('crypto');

const FROM_ADDRESS = 'hello@from100to200.com';
const FROM_NAME = 'from100to200 sales bot';
const DEFAULT_NOTIFY = 'from100to200@terberg.fi';

// --- Standard Webhooks signature verification ---------------------------
// Polar uses the Standard Webhooks spec (same as Svix). Header format:
//   webhook-id:        msg_xxx
//   webhook-timestamp: 1714323000
//   webhook-signature: v1,<base64-hmac-sha256>
// Signed payload string: `${webhook_id}.${webhook_timestamp}.${body}`
// Secret format: `whsec_<base64>` — strip the prefix, base64-decode for HMAC.
function verifySignature(headers, rawBody, secret) {
  if (!secret) return { ok: true, reason: 'no secret configured (dev mode)' };
  const id = headers['webhook-id'];
  const ts = headers['webhook-timestamp'];
  const sigHeader = headers['webhook-signature'];
  if (!id || !ts || !sigHeader) {
    return { ok: false, reason: 'missing webhook-id / -timestamp / -signature headers' };
  }
  const drift = Math.abs(Date.now() / 1000 - Number(ts));
  if (drift > 5 * 60) return { ok: false, reason: `timestamp drift ${Math.round(drift)}s` };

  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const signedContent = `${id}.${ts}.${rawBody}`;
  const expected = crypto.createHmac('sha256', secretBytes).update(signedContent).digest('base64');

  // Header is "v1,sig v1,sig2 ..." — any one matching is fine.
  const candidates = sigHeader.split(' ').map(part => part.split(',', 2)[1]).filter(Boolean);
  const match = candidates.some(c => {
    if (c.length !== expected.length) return false;
    return crypto.timingSafeEqual(Buffer.from(c), Buffer.from(expected));
  });
  return match
    ? { ok: true }
    : { ok: false, reason: 'signature mismatch' };
}

// --- Format the alert email --------------------------------------------
function buildEmail(event) {
  const type = event.type || 'unknown';
  const d = event.data || {};
  const fmtMoney = (cents, currency) => {
    if (typeof cents !== 'number') return '?';
    const sym = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : `${currency || ''} `;
    return `${sym}${(cents / 100).toFixed(2)}`;
  };
  const buyer = d.customer_email || d.customer?.email || '(unknown)';
  const product = d.product?.name || d.product_name || d.product_id || '(unknown product)';

  if (type === 'order.created') {
    const amt = fmtMoney(d.net_amount ?? d.amount, d.currency);
    return {
      subject: `💰 SALE — ${amt} from ${buyer}`,
      body: [
        `New order on Polar.`,
        ``,
        `Amount:    ${amt}`,
        `Buyer:     ${buyer}`,
        `Product:   ${product}`,
        `Order ID:  ${d.id || '?'}`,
        `When:      ${d.created_at || new Date().toISOString()}`,
        ``,
        `Polar dashboard: https://polar.sh/dashboard/100-to-200`,
      ].join('\n'),
    };
  }
  if (type === 'checkout.created') {
    return {
      subject: `👀 Checkout started — ${product}`,
      body: [
        `Someone opened the checkout. Not paid yet.`,
        ``,
        `Product:   ${product}`,
        `Checkout:  ${d.id || '?'}`,
        `When:      ${d.created_at || new Date().toISOString()}`,
        ``,
        `(If they pay you'll get a separate "💰 SALE" email.)`,
      ].join('\n'),
    };
  }
  if (type === 'order.refunded' || type === 'refund.created') {
    return {
      subject: `↩️ Refund — ${buyer}`,
      body: [
        `Refund issued on Polar.`,
        ``,
        `Buyer:     ${buyer}`,
        `Order ID:  ${d.order_id || d.id || '?'}`,
        `Reason:    ${d.reason || '(none provided)'}`,
        ``,
        `Update the ledger.`,
      ].join('\n'),
    };
  }
  // Unknown type — still ping so we know something's flowing.
  return {
    subject: `🔔 Polar webhook: ${type}`,
    body: `Unhandled event type. Raw payload:\n\n${JSON.stringify(event, null, 2).slice(0, 4000)}`,
  };
}

// --- Send via Postmark HTTP API ----------------------------------------
async function sendPostmark({ token, to, subject, body }) {
  const payload = {
    From: `${FROM_NAME} <${FROM_ADDRESS}>`,
    To: to,
    Subject: subject,
    TextBody: body,
    MessageStream: 'outbound',
  };
  const res = await fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Postmark-Server-Token': token,
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Postmark ${res.status}: ${text}`);
  return text;
}

// --- Main handler ------------------------------------------------------
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const rawBody = event.body || '';

  // Lower-case headers for case-insensitive lookup
  const headers = {};
  for (const [k, v] of Object.entries(event.headers || {})) headers[k.toLowerCase()] = v;

  const sig = verifySignature(headers, rawBody, process.env.POLAR_WEBHOOK_SECRET);
  if (!sig.ok) {
    console.warn(`[polar-webhook] signature check failed: ${sig.reason}`);
    return { statusCode: 401, body: `Bad signature: ${sig.reason}` };
  }

  let parsed;
  try {
    parsed = JSON.parse(rawBody);
  } catch (e) {
    console.error('[polar-webhook] bad JSON:', e.message);
    return { statusCode: 400, body: 'Bad JSON' };
  }

  const { subject, body } = buildEmail(parsed);
  const token = process.env.POSTMARK_TOKEN;
  const notifyEmail = process.env.NOTIFY_EMAIL || DEFAULT_NOTIFY;

  if (!token) {
    console.error('[polar-webhook] POSTMARK_TOKEN not configured');
    // Still return 200 so Polar doesn't retry — we logged the event
    return { statusCode: 200, body: 'OK (not emailed: token missing)' };
  }

  try {
    await sendPostmark({ token, to: notifyEmail, subject, body });
    console.log(`[polar-webhook] notified ${notifyEmail}: ${subject}`);
  } catch (e) {
    console.error('[polar-webhook] postmark send failed:', e.message);
    // Still return 200 — the event was received, we just failed to email
  }

  return { statusCode: 200, body: 'OK' };
};
