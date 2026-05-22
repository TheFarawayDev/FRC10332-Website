# FORGE Training Prototype (FRC 10332)

FORGE stands for **Focused Operations for Robotics Growth & Excellence**.

This repository now contains a full static prototype of a team training platform inspired by Canvas-style navigation, with FRC-specific sub-categories.

## What This Mockup Includes

- A 5-letter training system name: **FORGE**
- All-in-one navigation center: `portal.html`
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
- A fake account page with role controls and progress summary
- Six dropdown sections per module for testing, each with notes, watch content, and a quiz

## Project Structure

- `index.html`
	- Landing page and role/exemption controls
- `portal.html`
	- All-in-one navigation center and progress overview
- `account.html`
	- Fake member account and training status page
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

Use the role selector on `index.html` to simulate:

- Rookie member required flow
- Existing member exemption
- Mentor/lead override that forces completion

## Next Build Phase Ideas

- Add user authentication and real member roster sync
- Add mentor dashboard for overrides and assignment deadlines
- Replace static quiz answer keys with API-backed quiz authoring
- Add certificate export and competition readiness checks