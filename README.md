# FRC 10332 Chargebotics Website + Forge

Built by Marshall e.  
Public website + member dashboard + Forge training backend for FRC 10332.

## What’s in this repository

- **Public site pages**
  - `/index.html` (home)
  - `/calendar.html`
  - `/members.html`
  - `/logs.html`
  - `/posts.html`
- **Auth and member system**
  - `/auth.html` (sign in / sign up)
  - `/admin-approvals.html` (admin queue)
  - `/members-dashboard.html` (member dashboard)
- **Forge backend**
  - `/portal.html`
  - `/modules/*.html`
  - `/quizzes/*.html`
- **Core scripts**
  - `/public-site.js` public rendering + modal detail views
  - `/dashboard.js` member dashboard rendering + modal detail views
  - `/auth.js` auth flow, redirect guards, admin approvals
  - `/app.js` Forge UI, read-countdown unlocks, quiz flow
  - `/data.js` Forge program/module/quiz content

## Key updates included

- Extensionless URL behavior (`/members`, `/logs`, `/posts`, etc.) while keeping static `.html` runtime files.
- Improved top navigation styling plus admin bubble quick access.
- Sign-in screen content and layout polish.
- Modal detail views for member/log/post cards.
- Forge switched from “watch video to unlock” messaging to **Read This + countdown unlock** behavior.
- New **Site Maintenance** training module:
  - `/modules/site-maintenance.html`
  - module key: `site-maintenance` in `data.js`

## Local run

This is a static HTML/CSS/JS project (no package manager scripts).

Run with any static server, or open `index.html` directly in browser.

## Authentication behavior

- `firebase-config.js` holds Firebase placeholder config values.
- `firebase-init.js` provides Firebase wiring + local fallback auth mode.
- `auth.js` handles:
  - sign in
  - sign up with requested team selection
  - admin approval gate
  - dashboard/admin route guards

### Local fallback admin credentials

- Email: `admin@frc10332.org`
- Password: `admin10332`

## Maintenance training (for web team)

Use the **Site Maintenance** module in Forge for onboarding:

1. Open `/portal.html`
2. Enter **Site Maintenance**
3. Complete both read sections and checkoff quizzes

### Required maintenance workflow

1. Scope edits to only required files.
2. Verify page behavior in browser after each small change.
3. Re-check auth flow after any auth/nav edit:
   - sign in
   - sign up
   - admin approvals
4. Re-check public/member content cards and modal behavior.
5. Confirm extensionless URL appearance still works.
6. Update this README when architecture or workflow changes.

## File ownership quick map

- **Public UX/UI**: `site-v2.css`, public page HTML, `public-site.js`
- **Member dashboard UX**: `members-dashboard.html`, `dashboard.js`
- **Auth/admin flow**: `auth.html`, `admin-approvals.html`, `auth.js`, `firebase-init.js`
- **Forge learning system**: `portal.html`, `modules/*`, `quizzes/*`, `app.js`, `data.js`

## Deployment notes

- This project currently assumes static file hosting.
- If hosting supports extensionless rewrites, URLs and direct loads can both be extensionless.
- Without rewrites, navigation still resolves using runtime `.html` links managed in script.

## Safety and security notes

- Do not commit secrets or private keys.
- Keep Firebase credentials out of source when possible.
- Validate any auth-related change in both configured Firebase mode and local fallback mode.
