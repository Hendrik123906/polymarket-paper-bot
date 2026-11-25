// Polymarket order relay — Vercel Serverless Function (Node.js).
// POST /order only. Forwards the raw body + all auth headers verbatim to
// https://clob.polymarket.com/order, returns the CLOB response verbatim.
// Requires header X-Relay-Auth == process.env.RELAY_AUTH.
// The raw body MUST be forwarded untouched: the client's L2 signature is
// computed over the exact body bytes + path "/order".
const CLOB = 'https://clob.polymarket.com';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(404).json({ error: 'not found' });
  }
  if (req.headers['x-relay-auth'] !== process.env.RELAY_AUTH) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  // Read the raw body untouched.
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString('utf8');

  // Forward every header except hop-by-hop ones and our own auth header.
  const headers = {};
  for (const [k, v] of Object.entries(req.headers)) {
    const lk = k.toLowerCase();
    if (lk === 'host' || lk === 'connection' || lk === 'content-length' || lk === 'x-relay-auth') continue;
    headers[k] = v;
  }
  headers['content-type'] = 'application/json';

  const upstream = await fetch(CLOB + '/order', {
    method: 'POST',
    headers,
    body: rawBody,
  });
  const text = await upstream.text();
  res.status(upstream.status);
  res.setHeader('content-type', upstream.headers.get('content-type') || 'application/json');
  res.send(text);
};
