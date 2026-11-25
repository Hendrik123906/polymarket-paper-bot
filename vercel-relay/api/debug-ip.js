// TEMPORARY DEBUG: report this function's egress IP + country as seen by
// ipinfo.io, to diagnose why CLOB still 403s from Frankfurt. Remove after.
module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(404).json({ error: 'not found' });
  try {
    const r = await fetch('https://ipinfo.io/json', { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const d = await r.json();
    return res.json({ ip: d.ip, country: d.country, region: d.region, city: d.city, org: d.org });
  } catch (e) {
    return res.status(502).json({ error: 'ipinfo failed' });
  }
};
