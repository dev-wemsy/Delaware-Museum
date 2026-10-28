// POST: checks a demo account and sets the portal session cookies.
// GET:  tells the login page whether the demo accounts are still in use.
const crypto = require('crypto');

const SECRET = process.env.PORTAL_SECRET || 'dmm-prototype-secret-change-me';
const SESSION_HOURS = 8;

// Prototype accounts. Set PORTAL_VOLUNTEER_PASSWORD / PORTAL_BOARD_PASSWORD on
// Vercel to change them (the demo box on the login page then disappears).
// The production build replaces this with real per-person accounts.
const DEMO = { volunteer: 'first-state', board: 'blue-hens' };
const USERS = {
  volunteer: { role: 'volunteer', password: process.env.PORTAL_VOLUNTEER_PASSWORD || DEMO.volunteer },
  board:     { role: 'board',     password: process.env.PORTAL_BOARD_PASSWORD     || DEMO.board },
};
const usingDemo = USERS.volunteer.password === DEMO.volunteer && USERS.board.password === DEMO.board;

module.exports = (req, res) => {
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ demo: usingDemo, accounts: usingDemo ? DEMO : null });
  }
  if (req.method !== 'POST') return res.status(405).end();

  const body = req.body || {};
  const username = String(body.username || '').trim().toLowerCase();
  const password = String(body.password || '');
  const next = safeNext(body.next);
  const user = USERS[username];

  if (!user || !safeEqual(password, user.password)) {
    return res.redirect(303, `/portal/login?error=1&next=${encodeURIComponent(next)}`);
  }
  const exp = Math.floor(Date.now() / 1000) + SESSION_HOURS * 3600;
  const sig = crypto.createHmac('sha256', SECRET).update(`${user.role}.${exp}`).digest('hex');
  const secure = process.env.VERCEL ? '; Secure' : '';
  const maxAge = SESSION_HOURS * 3600;
  res.setHeader('Set-Cookie', [
    `dmm_portal=${user.role}.${exp}.${sig}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`,
    `dmm_role=${user.role}; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`,
  ]);
  return res.redirect(303, next);
};

function safeNext(value) {
  const v = String(value || '');
  return v.startsWith('/portal') && !v.startsWith('//') ? v : '/portal';
}
function safeEqual(a, b) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
