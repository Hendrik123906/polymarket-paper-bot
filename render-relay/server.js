// Polymarket order relay — long-running server for Render free tier.
// Same logic as the Vercel function: POST /order only, forwards the raw
// body + all auth headers verbatim to https://clob.polymarket.com/order,
// returns the CLOB response verbatim. Requires X-Relay-Auth.
// Strips caller-location headers so CLOB only sees this server's egress IP.
const http = require('http');

const CLOB = 'https://clob.polymarket.com';
const PORT = process.env.PORT || 10000;
const RELAY_AUTH = process.env.RELAY_AUTH || '';

const BLOCKED = new Set([
  'host', 'connection', 'content-length', 'x-relay-auth',
  'x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto',
  'x-real-ip', 'cf-connecting-ip', 'forwarded',
  'x-forwarded-port', 'x-forwarded-ssl',
]);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (req.method !== 'POST' || url.pathname !== '/order') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'not found' }));
  }
  if (req.headers['x-relay-auth'] !== RELAY_AUTH) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'unauthorized' }));
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString('utf8');

  const headers = {};
  for (const [k, v] of Object.entries(req.headers)) {
    const lk = k.toLowerCase();
    if (BLOCKED.has(lk)) continue;
    if (lk.startsWith('x-vercel-') || lk.startsWith('cf-') || lk.startsWith('x-render-')) continue;
    headers[k] = v;
  }
  headers['content-type'] = 'application/json';

  try {
    const upstream = await fetch(CLOB + '/order', {
      method: 'POST',
      headers,
      body: rawBody,
    });
    const text = await upstream.text();
    res.writeHead(upstream.status, {
      'Content-Type': upstream.headers.get('content-type') || 'application/json',
    });
    res.end(text);
  } catch (e) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'upstream failed' }));
  }
});

server.listen(PORT, () => console.log(`relay listening on ${PORT}`));
