# Symposium 2.0 — Hosting Setup Guide (Step 7)

Follow this in order. Nothing here needs coding knowledge — it's account creation and clicking through setup screens. Do this together as a team so more than one person knows how it works (important for next year's handover).

---

## PART A — Host the Frontend (GitHub Pages)

**What this does:** puts your 8 HTML pages online for free, at a link like `yourclub.github.io/symposium2`.

1. Go to [github.com](https://github.com) and create a free account (use a real email you'll keep access to — not a personal throwaway).
2. Click **New Repository**. Name it `symposium2.0`. Keep it **Public**. Don't add a README (we already have files).
3. Upload the contents of the `symposium2.0-core` folder I gave you:
   - Easiest way: on the repo page, click **"uploading an existing file"**, then drag in `index.html`, `about.html`, all other `.html` files, and the whole `assets` folder.
   - Make sure `index.html` ends up at the top level of the repo — not inside a subfolder.
4. Once uploaded, go to **Settings → Pages** (left sidebar).
5. Under "Build and deployment," set **Source: Deploy from a branch**, Branch: `main`, folder: `/ (root)`. Click **Save**.
6. Wait 1–2 minutes, then refresh — GitHub will show you a live link like `https://yourusername.github.io/symposium2.0/`.

Your frontend is now live. Anyone can visit that link and click through all 8 pages. (It'll still show placeholder content until Part B is done and Step 9 content is added.)

---

## PART B — Host the Backend + Database (Render)

**What this does:** runs your Node.js server and MySQL database live, 24/7, so the admin panel and real data actually work.

1. Go to [render.com](https://render.com) and sign up (you can sign up with your GitHub account — convenient, use that).
2. First, push the `symposium2-backend/server` folder to its own GitHub repo, same way as Part A (name it `symposium2-backend`).
3. On Render, click **New → Web Service**, connect your GitHub account, and select the `symposium2-backend` repo.
4. Set:
   - **Root Directory:** `server` (since server.js lives inside that subfolder)
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. Under **Environment Variables**, add each value from your `.env` file (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `PORT`) — Render has a simple form for this, one variable at a time. Don't upload the `.env` file itself.
6. Click **Create Web Service**. Render will build and deploy — takes a few minutes. You'll get a live URL like `https://symposium2-backend.onrender.com`.

**Database:** Render also offers a free MySQL-compatible database (or use Railway, PlanetScale, or similar):
1. On Render, click **New → PostgreSQL** or connect an external MySQL provider (Render's free tier historically favors PostgreSQL — if you specifically need MySQL, **Railway** is the simpler free option for that: New Project → Add MySQL → it gives you host/user/password/database values instantly).
2. Take the connection details it gives you and paste them into the same environment variables as step 5 above.
3. Run the contents of `database/schema.sql` against this live database once (most providers have a "Connect/Query" console in their dashboard where you can paste and run SQL directly).

---

## PART C — Connect Everything

1. Copy your live backend URL from Part B (e.g. `https://symposium2-backend.onrender.com`).
2. Open `assets/js/data.js` in your frontend repo and update:
   ```js
   const SYMPOSIUM_API_BASE_URL = "https://symposium2-backend.onrender.com";
   ```
3. Open `admin-panel/assets/admin.js` and update the same way:
   ```js
   window.API_BASE_URL = "https://symposium2-backend.onrender.com";
   ```
4. Re-upload these two updated files to their GitHub repos (or push via `git push` if your team is comfortable with Git commands).
5. Create your first real admin account by running the `create-admin` command from the backend README — but now it needs to run against your **live** database, not your laptop. Easiest way: run it locally once, pointing your local `.env` at the live database's connection details temporarily.

---

## PART D — Custom Domain (optional, do this whenever you're ready)

1. Buy a domain (Namecheap, GoDaddy, Google Domains — usually ₹500–₹1000/year for a `.com` or similar).
2. In GitHub Pages settings, add your custom domain under "Custom domain."
3. At your domain registrar, add the DNS records GitHub shows you (usually a few CNAME/A records — copy exactly).
4. Takes up to 24 hours to activate. Until then, the free `github.io` link keeps working.

---

## A note on the free tiers

Free hosting (Render/Railway free tier) sometimes "sleeps" the backend after inactivity — the first visitor after a quiet period might wait 20–30 seconds for it to wake up. This is completely normal for free hosting and not a bug. If it becomes a real problem once the site is getting traffic, upgrading to a small paid tier (often $5–7/month) removes this — a decision your team can make later, not now.

---

**Once Part A, B, and C are done, you're at Step 8 — Deploy & Test — which just means clicking through the live site together and confirming everything works end to end.**
