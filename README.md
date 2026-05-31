# Chargebotic Sites + Forge Backend Prototype (FRC 10332)

Chargebotic Sites is the main website where people get team info, updates, and resources.

Forge (Focused Operations for Robotics Growth & Excellence) is separate backend training software that members access through Chargebotic Sites.

## What This Mockup Includes

- Main site experience: `index.html` (Chargebotic Sites)
- Backend training center: `portal.html` (Forge)
- Sub-category module pages with embedded videos:
	- Business and Media
	- Safety
	- Strategy
	- Design
	- Control
	- Fabrication
	- Art
- Separate quiz file per quiz (14 files total)
- Completion rule: every quiz in a sub-category must be passed
- Exemption rule: existing members are exempt by default unless a lead/mentor override is enabled
- Local progress persistence using browser `localStorage`
- Extensionless visible URLs in the browser for a cleaner Canvas-style feel
- A member account/backend view with role controls and progress summary
- Six dropdown sections per module for testing, each with notes, watch content, and a quiz

## Project Structure

- `index.html`
	- Chargebotic Sites landing page and backend entry points
- `portal.html`
	- Forge backend training navigation center and progress overview
- `account.html`
	- Member account and backend access status page
- `styles.css`
	- Shared visual system and responsive layout
- `data.js`
	- Program/module configuration and quiz mapping
- `app.js`
	- Shared app logic, progress tracking, exemption handling, quiz grading hooks
- `modules/`
	- One module page per sub-category
- `quizzes/`
	- One standalone file per quiz

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

Use the role selector on `index.html` to simulate backend training behavior:

- Rookie member required flow
- Existing member exemption
- Mentor/lead override that forces completion

## Next Build Phase Ideas

- Add user authentication and real member roster sync
- Add mentor dashboard for overrides and assignment deadlines
- Replace static quiz answer keys with API-backed quiz authoring
- Add certificate export and competition readiness checks