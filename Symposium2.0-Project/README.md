# Symposium 2.0 — Complete Project Package (V2)

Everything built for Creative Codex's Symposium 2.0 website, in one place.

## What's inside

- **01-frontend/** — 24 public website pages (Home, About, Events, Event Detail, Schedule, Registration Hub, Registration Form, Committee, Members, Gallery, Previous Editions, Achievements, Sponsors, Recap, Live Updates, Downloads, Travel & Accommodation, Code of Conduct, Privacy Policy, Thank You/receipt, and system pages) + shared CSS/JS. This is what gets uploaded to GitHub Pages.
- **02-backend-and-admin-panel/** — the API server, MySQL database schema (27 tables), and the admin login/dashboard, including a full on-site dynamic registration module. This is what gets deployed to Render/Railway. Has its own README.md inside with setup instructions.
- **Symposium_2_0_SRS_V2.pdf** — the full requirements specification, updated to reflect exactly what was built, including a "V2 Change Summary" chapter listing every deviation from the original plan.
- **Symposium_2_0_Master_Prompt_V2.pdf** — rules, design system, and conventions for anyone (or any AI tool) extending this project. Read this before touching any code.
- **Symposium_2_0_Project_Documentation_V2.pdf** — plain-language project overview for your team (what the site does now, what changed, what's left to do).
- **Symposium_2.0_Hosting_Guide.md** — step-by-step guide to actually put this online (GitHub Pages + Render/Railway).

## What's new in V2

Registration now happens entirely on the website — no external Google Form. Participants pick an event, fill in that event's own set of questions (fully admin-configurable, nothing hardcoded), pay via UPI QR code, upload a payment screenshot, and get an instant registration ID and receipt. The admin panel has a full Registrations Hub to manage this per event: status, team size, fee, form fields, submissions, duplicate detection, and Excel/CSV export.

Also new: Travel & Accommodation, Judges/Mentors (revealed live during the event), Testimonials, Code of Conduct, and Privacy Policy pages — plus a revised, more restrained visual design system.

## Where things stand

1. Requirement Analysis — Done
2. UI/UX Design (V2 design system) — Done
3. Frontend (24 pages, all wired to live data) — Done
4. Backend + Database (27 tables, full registration module, security hardening) — Done
5. Admin Panel (incl. Registrations Hub) — Done
6. Full-project verification — Done, including real end-to-end registration flow testing
7. Documentation update — Done
8. Real Content — Pending: swap placeholders for real event names, dates, judges, sponsors
9. Hosting Setup — Pending: follow the Hosting Guide
10. Team/Faculty Review & Approval — Pending — required before deployment
11. Deploy & Launch — Pending, after review and hosting setup

## Quick start for a new team member

1. Read `Symposium_2_0_Project_Documentation_V2.pdf` first — explains the whole project without jargon.
2. Read `Symposium_2_0_Master_Prompt_V2.pdf` before changing any code — has the rules, design system, and known-pitfall notes from the V2 build.
3. Read `RUN_LOCALLY.md` to get everything running on your own laptop with `npm install` + `npm run dev` — one setup, one command, runs the frontend, admin panel, and backend together.
4. Read `Symposium_2_0_SRS_V2.pdf` for full requirement detail, especially the Registration Module section (Chapter 6) if you're working on that part.
