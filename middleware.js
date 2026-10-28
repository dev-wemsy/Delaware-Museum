// Edge Middleware: gates /portal/* behind the signed session cookie that
// /api/login issues. Prototype-grade auth — two demo roles, HMAC-signed cookie.
// The production build replaces this with real per-person accounts.
export const config = { matcher: ['/portal/:path*'] };

const OPEN = new Set(['/portal/login', '/portal/forbidden']);
const SECRET = process.env.PORTAL_SECRET || 'dmm-prototype-secret-change-me';

export default async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\.html$/, '').replace(/\/+$/, '') || '/';
  if (OPEN.has(path)) return next();

  const session = await readSession(getCookie(request, 'dmm_portal'));
  if (!session) {
    const login = new URL('/portal/login', url);
    login.searchParams.set('next', path);
    return Response.redirect(login, 307);
  }
  if (path.startsWith('/portal/board') && session.role !== 'board') {
    return Response.redirect(new URL('/portal/forbidden', url), 307);
  }
  return next();
}

// "Continue to the requested file." Same signal @vercel/edge's next() sends,
// inlined so the project needs no package.json or build step.
function next() {
  return new Response(null, { headers: { 'x-middleware-next': '1' } });
}

function getCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

async function readSession(token) {
  if (!token) return null;
  const [role, exp, sig] = token.split('.');
  if (!role || !exp || !sig) return null;
  if (Number(exp) < Date.now() / 1000) return null;
  const expected = await hmacHex(`${role}.${exp}`, SECRET);
  return timingSafeEqual(sig, expected) ? { role, exp: Number(exp) } : null;
}

async function hmacHex(message, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
