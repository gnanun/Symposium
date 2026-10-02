/* ============================================================
   SYMPOSIUM 2.0 — shared site behaviour
   EDIT: Config values below control date, seats, and links site-wide.
   ============================================================ */

// ---------- Live backend connection (used by every page) ----------
// EDIT: set this to your deployed backend URL once hosted
// (e.g. "https://symposium2-api.onrender.com").
const SYMPOSIUM_API_BASE_URL = "http://localhost:5000";

async function apiGet(path) {
  const res = await fetch(`${SYMPOSIUM_API_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error on ${path}`);
  return res.json();
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

// ---------- CONFIG (EDIT THESE) ----------
const CONFIG = {
  EVENT_DATE: "2026-10-28T09:00:00",
  SEATS_TOTAL: 250,
  SEATS_REGISTERED: #,
  REGISTER_LINK: "#",
  BROCHURE_LINK: "#",
};

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initCountdown();
  initReveal();
  initAccordion();
  initAboutTabs();
  initGalleryLightbox();
  initGalleryFilters();
  initSeatsBar();
  initActiveNavLink();
  initStatCounters();   // ← NEW
});

// ---------- Mobile nav ----------
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => links.classList.toggle("open"));

  document.querySelectorAll(".has-dropdown > a").forEach((a) => {
    a.addEventListener("click", (e) => {
      if (window.innerWidth <= 980) {
        e.preventDefault();
        a.parentElement.classList.toggle("open");
      }
    });
  });
}

// ---------- Highlight current page in nav ----------
function initActiveNavLink() {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path) a.classList.add("active");
  });
}

// ---------- Countdown ----------
function initCountdown() {
  const el = document.querySelector("[data-countdown]");
  if (!el) return;
  const target = new Date(CONFIG.EVENT_DATE).getTime();

  const dEl = el.querySelector("[data-d]");
  const hEl = el.querySelector("[data-h]");
  const mEl = el.querySelector("[data-m]");
  const sEl = el.querySelector("[data-s]");

  function tick() {
    const now = Date.now();
    let diff = Math.max(0, target - now);
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (dEl) dEl.textContent = String(d).padStart(2, "0");
    if (hEl) hEl.textContent = String(h).padStart(2, "0");
    if (mEl) mEl.textContent = String(m).padStart(2, "0");
    if (sEl) sEl.textContent = String(s).padStart(2, "0");
  }
  tick();
  setInterval(tick, 1000);
}

// ---------- Scroll reveal ----------
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((item) => obs.observe(item));
}

// ---------- Stat count-up animation (NEW) ----------
function initStatCounters() {
  const nums = document.querySelectorAll("[data-count]");
  if (!nums.length) return;

  const animate = (el) => {
    const target = Number(el.dataset.count);
    if (Number.isNaN(target)) return;
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  };

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animate(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  nums.forEach((el) => obs.observe(el));
}

// ---------- FAQ accordion ----------
function initAccordion() {
  document.querySelectorAll(".accordion-item").forEach((item) => {
    const q = item.querySelector(".accordion-q");
    if (!q) return;
    q.addEventListener("click", () => {
      const wasOpen = item.classList.contains("open");
      item.parentElement.querySelectorAll(".accordion-item").forEach((i) => i.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
    });
  });
}

// ---------- About page tabs ----------
function initAboutTabs() {
  const btns = document.querySelectorAll(".about-tab-btn");
  if (!btns.length) return;
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab");
      btns.forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".about-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.querySelector(`.about-panel[data-panel="${target}"]`)?.classList.add("active");
    });
  });
}

// ---------- Gallery filters + lightbox ----------
function initGalleryFilters() {
  const filterBar = document.getElementById("galleryFilters");
  if (!filterBar) return;
  const buttons = filterBar.querySelectorAll(".filter-btn");
  const items = document.querySelectorAll("#galleryGrid .gallery-item");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;
      items.forEach((item) => {
        const match = filter === "all" || item.dataset.category === filter;
        item.classList.toggle("filtered-out", !match);
      });
    });
  });
}

function initGalleryLightbox() {
  const items = document.querySelectorAll(".gallery-item");
  const lightbox = document.querySelector(".lightbox");
  if (!items.length || !lightbox) return;
  const caption = lightbox.querySelector("[data-caption]");
  items.forEach((item) => {
    item.addEventListener("click", () => {
      caption.textContent = item.getAttribute("data-caption") || "";
      lightbox.classList.add("open");
    });
  });
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.closest(".lightbox-close")) {
      lightbox.classList.remove("open");
    }
  });
}

// ---------- Seats progress bar ----------
function initSeatsBar() {
  const fill = document.querySelector("[data-seats-fill]");
  const label = document.querySelector("[data-seats-label]");
  if (!fill) return;
  const left = Math.max(0, CONFIG.SEATS_TOTAL - CONFIG.SEATS_REGISTERED);
  const pct = Math.min(100, (CONFIG.SEATS_REGISTERED / CONFIG.SEATS_TOTAL) * 100);
  requestAnimationFrame(() => { fill.style.width = pct + "%"; });
  if (label) {
    label.innerHTML = left > 0
      ? `<strong>${left}</strong> of ${CONFIG.SEATS_TOTAL} seats remaining`
      : `Registration full — <strong>waitlist open</strong>`;
  }
}
