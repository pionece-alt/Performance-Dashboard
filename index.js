const { onRequest } = require('firebase-functions/v2/https');
const https = require('https');
const http = require('http');

const GAS_URL = 'https://script.google.com/a/macros/matina.io/s/AKfycbxhRAMTVDkLd5Fklcgk8kyYjoBH2O2NEcZfdLurfxikv9e1mJvIxaHcmOpaO8CugE3n9g/exec';

function callGAS(params) {
  return new Promise((resolve, reject) => {
    const queryStr = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(typeof v === 'object' ? JSON.stringify(v) : v)}`)
      .join('&');
    const fullUrl = GAS_URL + '?' + queryStr;

    function fetchUrl(url, cb) {
      const parsed = new URL(url);
      const lib = parsed.protocol === 'https:' ? https : http;
      const req = lib.get(url, { headers: { 'User-Agent': 'Firebase-CloudFunction/1.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchUrl(res.headers.location, cb);
          return;
        }
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => cb(null, data));
      });
      req.on('error', cb);
      req.setTimeout(30000, () => { req.destroy(); cb(new Error('Timeout')); });
    }

    fetchUrl(fullUrl, (err, data) => {
      if (err) return reject(err);
      try { resolve(JSON.parse(data)); }
      catch(e) { resolve({ ok: false, error: 'Parse error: ' + (data || '').substring(0, 100) }); }
    });
  });
}

exports.gasProxy = onRequest(
  { region: 'asia-east1', cors: true },
  async (req, res) => {
    try {
      const action = req.query.action || '';
      const email  = req.query.email  || '';
      const p      = req.query.p      || '{}';
      if (!action || !email) {
        res.status(400).json({ ok: false, error: 'Missing action or email' });
        return;
      }
      const result = await callGAS({ api: '1', action, email, p });
      res.json(result);
    } catch(e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }
);