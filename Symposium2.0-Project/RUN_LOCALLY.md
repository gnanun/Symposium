# Running Symposium 2.0 Locally — Quick Start

This project is set up as a single **npm workspace** — one install, one command, runs everything. This is a standard, well-documented pattern (not something custom or fragile), so any future team member can look up "npm workspaces" and understand exactly how this is organized.

## One-time setup (do this once)

1. Install [Node.js](https://nodejs.org) (LTS version) and [MySQL](https://dev.mysql.com/downloads/) if you haven't already.
2. Open a terminal in this folder (`Symposium2.0-Project/`) and run:
   ```
   npm install
   ```
   This one command installs everything for the frontend, admin panel, AND backend — npm workspaces handles all three automatically. Nothing to configure.
3. Set up the database once:
   - Open MySQL and run everything inside `02-backend-and-admin-panel/server/database/schema.sql`.
   - Copy `02-backend-and-admin-panel/server/.env.example` to `.env` in that same folder, and fill in your real MySQL username/password.
4. Create your first admin login, from the root folder:
   ```
   npm run create-admin "Your Name" "username" "you@email.com" "password"
   ```

## Every time after that — one command

From the root folder:
```
npm run dev
```

This starts **all three pieces together**, each labeled in the terminal so you can tell them apart:
- **FRONTEND** (public website): [http://localhost:8080](http://localhost:8080)
- **ADMIN** (login + dashboard): [http://localhost:8081/login.html](http://localhost:8081/login.html)
- **BACKEND** (API server): [http://localhost:5000](http://localhost:5000)

Press `Ctrl + C` once to stop all three at the same time.

## Why this structure helps next year's team too

- **One install, one command** — a new team member doesn't need to know which folder does what before they can start working; `npm install` then `npm run dev` always works from the root.
- **Nothing hidden** — each piece (`01-frontend`, `02-backend-and-admin-panel/admin-panel`, `02-backend-and-admin-panel/server`) is still a normal, independent folder with its own `package.json`. Workspaces just link them for convenience; nothing stops you from running any one of them on its own if needed.
- **No framework added** — the frontend and admin panel are still plain HTML/CSS/JS. `http-server` is only a local preview tool; it isn't used at all once the site is hosted on GitHub Pages.
- **Same commands work for onboarding** — whoever leads the website next year just needs this one file (`RUN_LOCALLY.md`) to get started, without needing you to explain the folder structure in person.
