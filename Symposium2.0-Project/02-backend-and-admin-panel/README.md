# Symposium 2.0 — Backend + Admin Panel

This folder contains the parts that GitHub Pages **cannot** run: the API server, the database, and the admin login/dashboard. Keep this separate from the `symposium2.0-core` frontend folder.

## Folder overview

```
symposium2-backend/
├── server/                 ← the API (Node.js + Express + MySQL)
│   ├── server.js           ← entry point
│   ├── database/schema.sql ← run this once to create all tables
│   ├── routes/, config/, middleware/, utils/
│   ├── package.json
│   └── .env.example        ← copy to .env and fill in real values
└── admin-panel/             ← the login + dashboard (static HTML/CSS/JS)
    ├── login.html
    ├── dashboard.html
    └── assets/admin.js      ← set API_BASE_URL here
```

## 1. Local setup (test on your own laptop first)

1. Install [Node.js](https://nodejs.org) (LTS version) and [MySQL](https://dev.mysql.com/downloads/) if you don't have them.
2. Open a terminal in `server/` and run:
   ```
   npm install
   ```
3. Create the database: open MySQL and run everything in `database/schema.sql` (this creates all tables and two starter editions).
4. Copy `.env.example` to `.env` and fill in your real MySQL username/password and a random `JWT_SECRET`.
5. Create your first admin account:
   ```
   npm run create-admin -- "Gnanesh N" "gnanesh" "you@email.com" "your-password"
   ```
6. Start the server:
   ```
   npm start
   ```
   You should see `Symposium 2.0 backend running on port 5000`.
7. Open `admin-panel/login.html` directly in your browser and log in with the account you created.

## 2. Deploying for real (so it's live on the internet)

GitHub Pages **cannot** run this server — you need a host that runs Node.js. Two beginner-friendly, free-tier options:

- **Render** (render.com) — connect your GitHub repo, choose "Web Service," point it at the `server/` folder, set the environment variables from your `.env` in Render's dashboard, and it builds + deploys automatically.
- **Railway** (railway.app) — similar flow, also supports spinning up a MySQL database directly on the platform if you don't want to manage your own.

Either way, you'll also need a live MySQL database — both Render and Railway can provision one for you, or you can use a separate service like PlanetScale.

Once deployed, you'll get a live URL like `https://symposium2-api.onrender.com`. Update:
- `admin-panel/assets/admin.js` → `API_BASE_URL`
- The main frontend's `assets/js/script.js` (once we connect it to real data) → same URL

## 3. Adding more admin accounts each year (handover)

Run the same command as step 5 above with the new person's details — no code changes needed. Old admin accounts can be deactivated by setting `is_active = FALSE` on their row in `admin_accounts` if someone graduates and shouldn't have access anymore.

## 4. Adding a new symposium edition next year

Insert a new row into `symposium_editions` (via the admin dashboard's "Symposium Editions" section, or directly in the database), then set `is_current = TRUE` on it and `FALSE` on the old one. All new content added through the admin panel will be scoped to whichever edition is selected in the dashboard's edition switcher — old editions' data is never touched.
