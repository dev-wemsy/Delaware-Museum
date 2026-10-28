# Delaware Military Museum — website prototype

Live: https://delaware-museum-mockup.vercel.app
Reference mockups: `/mockups/modern` (chosen direction) and `/mockups/classic`.

Static HTML, no build step. Deployed to Vercel with `vercel deploy --prod`.

## Layout

```
index.html  about.html  visit.html  support.html  contact.html   public site
css/site.css   js/site.js                                        shared styles + script
portal/        css/portal.css  js/portal.js                      Volunteer & Board portal (sign-in required)
api/login.js   api/logout.js   middleware.js                     portal sign-in (prototype)
assets/        logo + photos
mockups/       the two original design concepts, untouched
```

## Things the museum supplies

All in the `SITE` block at the top of `js/site.js` — paste the URL between the quotes:

| Key | What |
| --- | --- |
| `calendarId` | Public Google Calendar ID for events (Visit + Home pages) |
| `facebook`, `unitsFacebook`, `youtube` | Social links (YouTube stays hidden until set) |
| `guidestar`, `newsletter`, `donate`, `membership` | Support links |
| `internalCalendarId` | Non-public Google Calendar for volunteers (portal Schedule page) |
| `driveFolder` | Shared Google Drive folder for volunteer documents (portal Documents page) |

Until a value is set, its button shows "Link coming soon" and calendar slots show a "being set up" message.

Facts that need museum sign-off are marked `<!-- CONFIRM WITH MUSEUM -->` in the HTML.

## Portal (prototype)

`/portal/login` — two demo accounts, `volunteer` and `board`. The login page shows
their passwords while the defaults are in use. Board-only pages (`/portal/board`)
turn volunteers away.

How it works: `api/login.js` checks the account and sets an HMAC-signed cookie;
`middleware.js` (Vercel Edge Middleware) checks that cookie on every `/portal/*`
request. Sample notices/documents are hard-coded in the HTML.

Environment variables (Vercel → Settings → Environment Variables):

| Variable | Purpose |
| --- | --- |
| `PORTAL_SECRET` | Cookie signing key. Set to a long random string. |
| `PORTAL_VOLUNTEER_PASSWORD`, `PORTAL_BOARD_PASSWORD` | Override the demo passwords; the demo box on the login page then disappears. |

This is prototype-grade auth for client review. The production portal replaces it
with real per-person accounts (e.g. Supabase Auth with email sign-in and a role per user).

## Local preview

Public pages open directly from disk. The portal needs the API and middleware:

```
vercel dev
```
