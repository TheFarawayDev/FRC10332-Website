# Chargebotic Sites + Forge Backend Prototype (FRC 10332)

Chargebotic Sites is the public-facing main website for team visibility.

Forge (Focused Operations for Robotics Growth & Excellence) remains the separate backend training software that members access after member sign-in.

## What This Mockup Includes

- Public-first main site: `index.html`
  - Team calendar
  - Public member directory
  - Team/sub-team logs
  - New posts
  - Google-style public search bar
- Member auth entry page: `auth.html`
  - Login + Sign Up UI
  - Firebase-ready groundwork with local fallback mode
- Members dashboard: `members-dashboard.html`
  - Auth-gated member view
  - Internal logs/posts snapshot
  - Google-style dashboard search
- Forge backend center: `portal.html`
- Existing Forge module pages and standalone quizzes

## Project Structure

- `index.html`
  - Public homepage experience
- `auth.html`
  - Member Login/Sign Up
- `members-dashboard.html`
  - Auth-gated members dashboard
- `public-site.js`
  - Public content rendering + search behavior
- `auth.js`
  - Login/signup wiring, dashboard guard, logout
- `dashboard.js`
  - Member dashboard rendering + search behavior
- `firebase-config.js`
  - Firebase config placeholder (no secrets)
- `firebase-init.js`
  - Firebase initialization scaffold with local auth fallback
- `site-v2.css`
  - Public/auth/dashboard visual system
- `portal.html`, `modules/`, `quizzes/`, `data.js`, `app.js`, `styles.css`
  - Existing Forge training system

## Module Pages

- `modules/business-media.html`
- `modules/safety.html`
- `modules/strategy.html`
- `modules/design.html`
- `modules/control.html`
- `modules/fabrication.html`
- `modules/art.html`

## Quiz Files

- `quizzes/business-branding.html`
- `quizzes/business-outreach.html`
- `quizzes/safety-ppe.html`
- `quizzes/safety-shop-zones.html`
- `quizzes/strategy-scouting.html`
- `quizzes/strategy-match-planning.html`
- `quizzes/design-cad-standards.html`
- `quizzes/design-dfm.html`
- `quizzes/control-wiring-basics.html`
- `quizzes/control-code-practices.html`
- `quizzes/fabrication-measurement.html`
- `quizzes/fabrication-machine-ops.html`
- `quizzes/art-brand-visuals.html`
- `quizzes/art-pit-presentation.html`

## Running It

Open `index.html` in a browser in the dev container or VS Code preview.

Member access flow:

- Open `auth.html`
- Sign up or log in
- You will be redirected to `members-dashboard.html`
- From the dashboard, members can continue into Forge (`portal.html`)

## Firebase Groundwork

- `firebase-config.js` is a placeholder scaffold and intentionally contains empty values.
- To enable real Firebase auth:
  1. Add your Firebase web config values in `firebase-config.js`
  2. Load Firebase SDK scripts before `firebase-init.js`
- If Firebase is not configured, the app uses local `localStorage` fallback auth for development.

## Next Build Phase Ideas

- Add user authentication and real member roster sync
- Add mentor dashboard for overrides and assignment deadlines
- Replace static quiz answer keys with API-backed quiz authoring
- Add certificate export and competition readiness checks