// ============================================================
// SYMPOSIUM 2.0 — ADMIN PANEL LOGIC
// EDIT: set API_BASE_URL to your deployed backend URL once hosted
// (e.g. "https://symposium2-api.onrender.com"). Leave as-is for
// local testing against a backend running on your own machine.
// ============================================================
window.API_BASE_URL = "http://localhost:5000";

// ---------- Entity configuration ----------
// One entry per content type. `fields` drives both the table
// columns shown and the add/edit form generated for it.
const ENTITIES = {
  events: {
    label: "Events", endpoint: "/api/events", idField: "event_id",
    fields: [
      { name: "event_name", label: "Event Name", type: "text", required: true },
      { name: "category", label: "Category", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "rules", label: "Rules", type: "textarea" },
      { name: "team_size", label: "Team Size", type: "text" },
      { name: "duration", label: "Duration", type: "text" },
      { name: "coordinator_name", label: "Coordinator Name", type: "text" },
      { name: "coordinator_contact", label: "Coordinator Contact", type: "text" },
      { name: "display_order", label: "Display Order", type: "number" },
    ],
    columns: ["event_name", "category", "team_size", "duration"],
  },
  schedule: {
    label: "Schedule", endpoint: "/api/schedule", idField: "schedule_id",
    fields: [
      { name: "item_title", label: "Title", type: "text", required: true },
      { name: "start_time", label: "Start Time", type: "datetime-local" },
      { name: "end_time", label: "End Time", type: "datetime-local" },
      { name: "location", label: "Location", type: "text" },
      { name: "display_order", label: "Display Order", type: "number" },
    ],
    columns: ["item_title", "start_time", "location"],
  },
  committee: {
    label: "Committee", endpoint: "/api/committee", idField: "committee_id",
    fields: [
      { name: "full_name", label: "Full Name", type: "text", required: true },
      { name: "designation", label: "Designation", type: "text", required: true },
      { name: "photo_url", label: "Photo URL", type: "text" },
      { name: "display_order", label: "Display Order", type: "number" },
    ],
    columns: ["full_name", "designation"],
  },
  members: {
    label: "Members", endpoint: "/api/members", idField: "member_id",
    fields: [
      { name: "full_name", label: "Full Name", type: "text", required: true },
      { name: "designation", label: "Designation", type: "text", required: true },
      { name: "photo_url", label: "Photo URL", type: "text" },
      { name: "display_order", label: "Display Order", type: "number" },
    ],
    columns: ["full_name", "designation"],
  },
  gallery: {
    label: "Gallery", endpoint: "/api/gallery", idField: "gallery_id",
    fields: [
      { name: "image_url", label: "Image URL", type: "text", required: true },
      { name: "caption", label: "Caption", type: "text" },
      { name: "display_order", label: "Display Order", type: "number" },
    ],
    columns: ["caption", "image_url"],
  },
  faqs: {
    label: "FAQs", endpoint: "/api/faqs", idField: "faq_id",
    fields: [
      { name: "question", label: "Question", type: "text", required: true },
      { name: "answer", label: "Answer", type: "textarea", required: true },
      { name: "display_order", label: "Display Order", type: "number" },
    ],
    columns: ["question"],
  },
  sponsors: {
    label: "Sponsors", endpoint: "/api/sponsors", idField: "sponsor_id",
    fields: [
      { name: "sponsor_name", label: "Sponsor Name", type: "text", required: true },
      { name: "logo_url", label: "Logo URL", type: "text" },
      { name: "tier", label: "Tier", type: "text" },
      { name: "website_url", label: "Website URL", type: "text" },
      { name: "display_order", label: "Display Order", type: "number" },
    ],
    columns: ["sponsor_name", "tier"],
  },
  achievements: {
    label: "Achievements", endpoint: "/api/achievements", idField: "achievement_id",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "achieved_at", label: "Date", type: "date" },
    ],
    columns: ["title", "achieved_at"],
  },
  downloads: {
    label: "Downloads", endpoint: "/api/downloads", idField: "download_id",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "file_url", label: "File URL", type: "text", required: true },
    ],
    columns: ["title", "file_url"],
  },
  announcements: {
    label: "Announcements", endpoint: "/api/announcements", idField: "announcement_id",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "message", label: "Message", type: "textarea", required: true },
    ],
    columns: ["title"],
  },
  liveUpdates: {
    label: "Live Updates", endpoint: "/api/live-updates", idField: "update_id",
    fields: [
      { name: "update_text", label: "Update Text", type: "textarea", required: true },
    ],
    columns: ["update_text"],
  },
  judges: {
    label: "Judges / Mentors", endpoint: "/api/judges", idField: "judge_id",
    fields: [
      { name: "full_name", label: "Full Name", type: "text", required: true },
      { name: "designation", label: "Designation", type: "text" },
      { name: "organisation", label: "Organisation", type: "text" },
      { name: "photo_url", label: "Photo URL", type: "text" },
      { name: "is_revealed", label: "Revealed publicly? (1 = yes, 0 = no — stays hidden until you flip this)", type: "number" },
      { name: "display_order", label: "Display Order", type: "number" },
    ],
    columns: ["full_name", "designation", "is_revealed"],
  },
  testimonials: {
    label: "Testimonials", endpoint: "/api/testimonials", idField: "testimonial_id",
    fields: [
      { name: "author_name", label: "Author Name", type: "text", required: true },
      { name: "author_college", label: "Author College", type: "text" },
      { name: "quote", label: "Quote", type: "textarea", required: true },
      { name: "photo_url", label: "Photo URL", type: "text" },
      { name: "is_demo", label: "Demo content? (1 = yes, 0 = real quote)", type: "number" },
      { name: "display_order", label: "Display Order", type: "number" },
    ],
    columns: ["author_name", "author_college", "is_demo"],
  },
  travelInfo: {
    label: "Travel & Stay", endpoint: "/api/travel-info", idField: "section_id",
    fields: [
      { name: "heading", label: "Heading (e.g. 'By Train')", type: "text", required: true },
      { name: "content", label: "Content", type: "textarea", required: true },
      { name: "display_order", label: "Display Order", type: "number" },
    ],
    columns: ["heading"],
  },
  codeOfConduct: {
    label: "Code of Conduct", endpoint: "/api/code-of-conduct", idField: "conduct_id",
    fields: [
      { name: "content", label: "Full Code of Conduct Text", type: "textarea", required: true },
    ],
    columns: ["content"],
  },
  registration: {
    label: "Registration Settings", endpoint: "/api/registration", idField: "registration_id",
    fields: [
      { name: "is_open", label: "Registration Open? (1 = yes, 0 = no)", type: "number" },
      { name: "external_form_url", label: "External Form URL", type: "text" },
      { name: "seats_total", label: "Seats Total", type: "number" },
      { name: "seats_registered", label: "Seats Registered", type: "number" },
      { name: "deadline", label: "Deadline", type: "datetime-local" },
    ],
    columns: ["external_form_url", "seats_total", "seats_registered"],
  },
  contactInfo: {
    label: "Contact Info", endpoint: "/api/contact-info", idField: "contact_id",
    fields: [
      { name: "email", label: "Email", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "address", label: "Address", type: "text" },
      { name: "instagram_url", label: "Instagram URL", type: "text" },
      { name: "linkedin_url", label: "LinkedIn URL", type: "text" },
      { name: "youtube_url", label: "YouTube URL", type: "text" },
    ],
    columns: ["email", "phone"],
  },
  editions: {
    label: "Symposium Editions", endpoint: "/api/editions", idField: "edition_id",
    fields: [
      { name: "edition_number", label: "Edition Number", type: "number", required: true },
      { name: "edition_name", label: "Edition Name", type: "text", required: true },
      { name: "theme", label: "Theme", type: "text" },
      { name: "event_date", label: "Event Date", type: "date" },
      { name: "is_current", label: "Current Edition? (1 = yes, 0 = no)", type: "number" },
      { name: "status", label: "Status (upcoming/ongoing/completed/archived)", type: "text" },
    ],
    columns: ["edition_name", "status", "event_date"],
    noEditionFilter: true, // editions themselves aren't scoped to an edition
  },
};

let state = { section: "overview", editionId: null, editions: [], editRow: null };

document.addEventListener("DOMContentLoaded", () => {
  if (!getToken()) { window.location.href = "login.html"; return; }
  document.getElementById("adminNameSpan").textContent = " " + (localStorage.getItem("symposium_admin_name") || "");
  document.getElementById("logoutBtn").addEventListener("click", logout);
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalOverlay").addEventListener("click", (e) => { if (e.target.id === "modalOverlay") closeModal(); });
  document.getElementById("addNewBtn").addEventListener("click", () => openModal(null));
  document.getElementById("editionSelect").addEventListener("change", (e) => { state.editionId = e.target.value; renderSection(); });

  document.querySelectorAll(".sidebar-nav a").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".sidebar-nav a").forEach((x) => x.classList.remove("active"));
      a.classList.add("active");
      state.section = a.dataset.section;
      renderSection();
    });
  });

  loadEditions();
});

function getToken() { return localStorage.getItem("symposium_admin_token"); }
function logout() {
  localStorage.removeItem("symposium_admin_token");
  localStorage.removeItem("symposium_admin_name");
  window.location.href = "login.html";
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${window.API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) { logout(); throw new Error("Session expired."); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

async function loadEditions() {
  try {
    const editions = await apiFetch("/api/editions");
    state.editions = editions;
    const select = document.getElementById("editionSelect");
    select.innerHTML = editions
      .map((e) => `<option value="${e.edition_id}">${e.edition_name} (${e.status})</option>`)
      .join("");
    const current = editions.find((e) => e.is_current) || editions[0];
    if (current) { select.value = current.edition_id; state.editionId = current.edition_id; }
    renderSection();
  } catch (err) {
    document.getElementById("contentArea").innerHTML = `<p class="empty-state">Could not connect to the backend. Check that API_BASE_URL in assets/admin.js is correct and the server is running.<br><br>${err.message}</p>`;
  }
}

async function renderSection() {
  const title = document.getElementById("sectionTitle");
  const sub = document.getElementById("sectionSub");
  const toolbar = document.getElementById("sectionToolbar");
  const overviewCards = document.getElementById("overviewCards");
  const contentArea = document.getElementById("contentArea");

  if (state.section === "overview") {
    title.textContent = "Overview";
    sub.textContent = "A quick snapshot of this edition's content.";
    toolbar.style.display = "none";
    overviewCards.style.display = "grid";
    contentArea.innerHTML = "";
    await renderOverview();
    return;
  }

  if (state.section === "registrationsHub") {
    title.textContent = "Registrations";
    sub.textContent = "Set up and manage registration for each event.";
    toolbar.style.display = "none";
    overviewCards.style.display = "none";
    contentArea.innerHTML = "";
    await renderRegistrationsHub();
    return;
  }

  overviewCards.style.display = "none";
  overviewCards.innerHTML = "";
  const cfg = ENTITIES[state.section];
  title.textContent = cfg.label;
  sub.textContent = `Manage ${cfg.label.toLowerCase()} for the selected edition.`;
  toolbar.style.display = "block";
  await renderTable(cfg);
}

async function renderOverview() {
  const cards = document.getElementById("overviewCards");
  cards.innerHTML = `<div class="overview-card"><div class="num">…</div><div class="label">Loading</div></div>`;
  const keys = ["events", "gallery", "committee", "members", "sponsors", "faqs"];
  const results = await Promise.all(
    keys.map(async (k) => {
      try {
        const cfg = ENTITIES[k];
        const rows = await apiFetch(`${cfg.endpoint}?edition_id=${state.editionId}`);
        return { label: cfg.label, count: rows.length };
      } catch { return { label: ENTITIES[k].label, count: "—" }; }
    })
  );
  cards.innerHTML = results
    .map((r) => `<div class="overview-card"><div class="num">${r.count}</div><div class="label">${r.label}</div></div>`)
    .join("");
}

async function renderTable(cfg) {
  const contentArea = document.getElementById("contentArea");
  contentArea.innerHTML = `<p class="empty-state">Loading…</p>`;
  try {
    const query = cfg.noEditionFilter ? "" : `?edition_id=${state.editionId}`;
    const rows = await apiFetch(`${cfg.endpoint}${query}`);

    if (!rows.length) {
      contentArea.innerHTML = `<div class="empty-state">No ${cfg.label.toLowerCase()} yet for this edition. Click "+ Add New" to create one.</div>`;
      return;
    }

    const headers = cfg.columns.map((c) => `<th>${labelFor(cfg, c)}</th>`).join("");
    const rowsHtml = rows
      .map((row) => {
        const cells = cfg.columns.map((c) => `<td>${escapeHtml(String(row[c] ?? ""))}</td>`).join("");
        return `<tr>
          ${cells}
          <td class="row-actions">
            <button class="edit-btn" data-id="${row[cfg.idField]}">Edit</button>
            <button class="delete-btn" data-id="${row[cfg.idField]}">Delete</button>
          </td>
        </tr>`;
      })
      .join("");

    contentArea.innerHTML = `<table class="data-table"><thead><tr>${headers}<th>Actions</th></tr></thead><tbody>${rowsHtml}</tbody></table>`;

    contentArea.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const row = rows.find((r) => String(r[cfg.idField]) === btn.dataset.id);
        openModal(row);
      });
    });
    contentArea.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Delete this entry? This cannot be undone.")) return;
        try {
          await apiFetch(`${cfg.endpoint}/${btn.dataset.id}`, { method: "DELETE" });
          renderSection();
        } catch (err) { alert(err.message); }
      });
    });
  } catch (err) {
    contentArea.innerHTML = `<p class="empty-state">${err.message}</p>`;
  }
}

function labelFor(cfg, colName) {
  return cfg.fields.find((f) => f.name === colName)?.label || colName;
}

// ============================================================
// Registrations Hub — the one custom (non-generic) admin section.
// Unlike the other content types, registration setup is nested
// per-event (settings + dynamic fields), and submissions need
// search/export/payment actions that don't fit the generic
// table+modal pattern used everywhere else.
// ============================================================
let regHubState = { eventId: null, events: [], tab: "setup" };

async function renderRegistrationsHub() {
  const contentArea = document.getElementById("contentArea");
  contentArea.innerHTML = `<p class="empty-state">Loading events…</p>`;
  try {
    const events = await apiFetch(`/api/events?edition_id=${state.editionId}`);
    if (state.section !== "registrationsHub") return; // navigated away while this was loading
    regHubState.events = events;
    if (!events.length) {
      contentArea.innerHTML = `<div class="empty-state">No events exist yet for this edition. Create an event first under "Events", then come back here to set up its registration.</div>`;
      return;
    }
    if (!regHubState.eventId || !events.some((e) => String(e.event_id) === String(regHubState.eventId))) {
      regHubState.eventId = events[0].event_id;
    }

    contentArea.innerHTML = `
      <div class="reg-hub">
        <div class="reg-hub-toolbar">
          <label>Event:
            <select id="regEventSelect">
              ${events.map((e) => `<option value="${e.event_id}" ${String(e.event_id) === String(regHubState.eventId) ? "selected" : ""}>${escapeHtml(e.event_name)}</option>`).join("")}
            </select>
          </label>
          <div class="reg-tabs">
            <button class="reg-tab-btn ${regHubState.tab === "setup" ? "active" : ""}" data-tab="setup">Setup</button>
            <button class="reg-tab-btn ${regHubState.tab === "fields" ? "active" : ""}" data-tab="fields">Form Fields</button>
            <button class="reg-tab-btn ${regHubState.tab === "submissions" ? "active" : ""}" data-tab="submissions">Submissions</button>
            <button class="reg-tab-btn ${regHubState.tab === "duplicates" ? "active" : ""}" data-tab="duplicates">Duplicates</button>
          </div>
        </div>
        <div id="regHubBody"></div>
      </div>
    `;

    document.getElementById("regEventSelect").addEventListener("change", (e) => {
      regHubState.eventId = e.target.value;
      renderRegHubTab();
    });
    contentArea.querySelectorAll(".reg-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => { regHubState.tab = btn.dataset.tab; renderRegistrationsHub(); });
    });

    await renderRegHubTab();
  } catch (err) {
    contentArea.innerHTML = `<p class="empty-state">${err.message}</p>`;
  }
}

async function renderRegHubTab() {
  const body = document.getElementById("regHubBody");
  if (regHubState.tab === "setup") return renderRegSetupTab(body);
  if (regHubState.tab === "fields") return renderRegFieldsTab(body);
  if (regHubState.tab === "submissions") return renderRegSubmissionsTab(body);
  if (regHubState.tab === "duplicates") return renderRegDuplicatesTab(body);
}

// ---------- Setup tab: per-event status, team size, fee, QR, capacity ----------
async function renderRegSetupTab(body) {
  body.innerHTML = `<p class="empty-state">Loading…</p>`;
  const rows = await apiFetch(`/api/event-registration-settings?event_id=${regHubState.eventId}`);
  if (!document.body.contains(body)) return; // navigated away while this was loading
  const settings = rows[0] || null;

  body.innerHTML = `
    <form id="regSetupForm" class="reg-setup-form">
      <label>Status
        <select name="status">
          ${["not_set", "coming_soon", "open", "paused", "closed", "full"].map((s) =>
            `<option value="${s}" ${settings?.status === s ? "selected" : ""}>${s.replace("_", " ")}</option>`
          ).join("")}
        </select>
      </label>
      <label>Team Size Min<input type="number" name="team_size_min" value="${settings?.team_size_min ?? 1}" min="1"></label>
      <label>Team Size Max<input type="number" name="team_size_max" value="${settings?.team_size_max ?? 1}" min="1"></label>
      <label>Fee Amount (₹)<input type="number" step="0.01" name="fee_amount" value="${settings?.fee_amount ?? 0}"></label>
      <label>UPI QR Code Image URL<input type="text" name="qr_code_url" value="${escapeHtml(settings?.qr_code_url ?? "")}" placeholder="Upload the QR image somewhere and paste its link here"></label>
      <label>Seats Total<input type="number" name="seats_total" value="${settings?.seats_total ?? 100}" min="1"></label>
      <label>Deadline<input type="datetime-local" name="deadline" value="${settings?.deadline ? settings.deadline.slice(0, 16) : ""}"></label>
      ${settings ? `<p class="reg-seats-note">Currently registered: <strong>${settings.seats_registered}</strong> / ${settings.seats_total} (this updates automatically — not editable here)</p>` : ""}
      <button type="submit" class="btn-primary" style="width:auto">Save Registration Settings</button>
    </form>
  `;

  document.getElementById("regSetupForm").onsubmit = async (e) => {
    e.preventDefault();
    const f = e.target;
    const payload = {
      event_id: Number(regHubState.eventId),
      status: f.elements["status"].value,
      team_size_min: Number(f.elements["team_size_min"].value),
      team_size_max: Number(f.elements["team_size_max"].value),
      fee_amount: Number(f.elements["fee_amount"].value),
      qr_code_url: f.elements["qr_code_url"].value,
      seats_total: Number(f.elements["seats_total"].value),
      deadline: f.elements["deadline"].value || null,
    };
    try {
      if (settings) {
        await apiFetch(`/api/event-registration-settings/${settings.event_reg_id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await apiFetch(`/api/event-registration-settings`, { method: "POST", body: JSON.stringify(payload) });
      }
      alert("Saved.");
      renderRegHubTab();
    } catch (err) { alert(err.message); }
  };
}

// ---------- Fields tab: add/edit/delete this event's dynamic form fields, in order ----------
const FIELD_TYPES = ["short_text", "long_text", "email", "phone", "number", "dropdown", "radio", "checkbox", "date", "url", "file"];

async function renderRegFieldsTab(body) {
  body.innerHTML = `<p class="empty-state">Loading…</p>`;
  const fields = await apiFetch(`/api/registration-fields?event_id=${regHubState.eventId}`);
  if (!document.body.contains(body)) return; // navigated away while this was loading
  fields.sort((a, b) => a.display_order - b.display_order);

  const rowsHtml = fields.length
    ? fields.map((f) => `
        <tr>
          <td>${f.display_order}</td>
          <td>${escapeHtml(f.field_label)}</td>
          <td>${f.field_type}</td>
          <td>${f.is_required ? "Yes" : "No"}</td>
          <td class="row-actions"><button class="delete-btn" data-id="${f.field_id}">Delete</button></td>
        </tr>`).join("")
    : `<tr><td colspan="5" class="empty-state">No fields yet — add the first one below. Fields appear on the public form in the order you add them.</td></tr>`;

  body.innerHTML = `
    <table class="data-table">
      <thead><tr><th>Order</th><th>Label</th><th>Type</th><th>Required</th><th>Actions</th></tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    <form id="addFieldForm" class="reg-add-field-form">
      <h4>Add a field</h4>
      <label>Field Label<input type="text" name="field_label" required placeholder="e.g. USN"></label>
      <label>Field Type
        <select name="field_type">${FIELD_TYPES.map((t) => `<option value="${t}">${t.replace("_", " ")}</option>`).join("")}</select>
      </label>
      <label>Options (comma-separated, only for dropdown/radio/checkbox)<input type="text" name="field_options" placeholder="Option A, Option B"></label>
      <label><input type="checkbox" name="is_required" checked> Required</label>
      <button type="submit" class="btn-primary" style="width:auto">+ Add Field</button>
    </form>
  `;

  body.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this field? Existing answers for it will also be removed.")) return;
      await apiFetch(`/api/registration-fields/${btn.dataset.id}`, { method: "DELETE" });
      renderRegFieldsTab(body);
    });
  });

  document.getElementById("addFieldForm").onsubmit = async (e) => {
    e.preventDefault();
    const f = e.target;
    const optionsRaw = f.elements["field_options"].value;
    const options = optionsRaw.trim()
      ? JSON.stringify(optionsRaw.split(",").map((s) => s.trim()))
      : null;
    const payload = {
      event_id: Number(regHubState.eventId),
      field_label: f.elements["field_label"].value,
      field_type: f.elements["field_type"].value,
      field_options: options,
      is_required: f.elements["is_required"].checked ? 1 : 0,
      display_order: fields.length ? Math.max(...fields.map((x) => x.display_order)) + 1 : 1,
    };
    try {
      await apiFetch(`/api/registration-fields`, { method: "POST", body: JSON.stringify(payload) });
      renderRegFieldsTab(body);
    } catch (err) { alert(err.message); }
  };
}

// ---------- Submissions tab: search, view, mark paid, export ----------
async function renderRegSubmissionsTab(body) {
  body.innerHTML = `<p class="empty-state">Loading…</p>`;
  const regs = await apiFetch(`/api/registrations?event_id=${regHubState.eventId}`);
  if (!document.body.contains(body)) return; // navigated away while this was loading

  body.innerHTML = `
    <div class="reg-submissions-toolbar">
      <input type="text" id="regSearchInput" placeholder="Search by team name or registration ID…">
      <a class="btn-primary reg-export-link" style="width:auto" href="${window.API_BASE_URL}/api/registrations/${regHubState.eventId}/export?format=xlsx" target="_blank">Export Excel</a>
      <a class="btn-primary reg-export-link" style="width:auto" href="${window.API_BASE_URL}/api/registrations/${regHubState.eventId}/export?format=csv" target="_blank">Export CSV</a>
    </div>
    ${regs.length ? `
      <table class="data-table">
        <thead><tr><th>Registration ID</th><th>Team Name</th><th>Payment</th><th>Submitted</th><th>Actions</th></tr></thead>
        <tbody id="regSubmissionsBody">
          ${regs.map((r) => `
            <tr data-search="${escapeHtml((r.registration_id + " " + (r.team_name || "")).toLowerCase())}">
              <td>${r.registration_id}</td>
              <td>${escapeHtml(r.team_name || "—")}</td>
              <td><span class="payment-badge ${r.payment_status}">${r.payment_status.replace("_", " ")}</span></td>
              <td>${new Date(r.submitted_at).toLocaleString()}</td>
              <td class="row-actions">
                ${r.payment_status !== "paid" ? `<button class="edit-btn mark-paid-btn" data-id="${r.registration_id}">Mark Paid</button>` : ""}
              </td>
            </tr>`).join("")}
        </tbody>
      </table>
    ` : `<div class="empty-state">No registrations yet for this event.</div>`}
  `;

  document.getElementById("regSearchInput")?.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll("#regSubmissionsBody tr").forEach((tr) => {
      tr.style.display = tr.dataset.search.includes(term) ? "" : "none";
    });
  });

  body.querySelectorAll(".mark-paid-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await apiFetch(`/api/registrations/${btn.dataset.id}/payment-status`, { method: "PUT", body: JSON.stringify({ payment_status: "paid" }) });
        renderRegSubmissionsTab(body);
      } catch (err) { alert(err.message); }
    });
  });
}

// ---------- Duplicates tab: flagged, not blocked ----------
async function renderRegDuplicatesTab(body) {
  body.innerHTML = `<p class="empty-state">Loading…</p>`;
  const duplicates = await apiFetch(`/api/registrations/${regHubState.eventId}/duplicates`);
  if (!document.body.contains(body)) return; // navigated away while this was loading
  if (!duplicates.length) {
    body.innerHTML = `<div class="empty-state">No possible duplicate registrations detected for this event.</div>`;
    return;
  }
  body.innerHTML = `
    <div class="empty-state" style="text-align:left; background:#fff7ed; border-color:#fdba74; color:#7c2d12;">
      These are flagged for your review only — participants are not blocked from registering for multiple events, so use judgement before contacting anyone.
    </div>
    <table class="data-table">
      <thead><tr><th>Matching Field</th><th>Value</th><th>Registrations</th></tr></thead>
      <tbody>
        ${duplicates.map((d) => `
          <tr>
            <td>${escapeHtml(d.field)}</td>
            <td>${escapeHtml(d.value)}</td>
            <td>${d.registrations.map((r) => `${r.registration_id} (${escapeHtml(r.team_name || "—")})`).join(", ")}</td>
          </tr>`).join("")}
      </tbody>
    </table>
  `;
}

function openModal(row) {
  const cfg = ENTITIES[state.section];
  state.editRow = row;
  document.getElementById("modalTitle").textContent = row ? `Edit ${cfg.label}` : `Add ${cfg.label}`;

  const form = document.getElementById("modalForm");
  const fieldsHtml = cfg.fields
    .map((f) => {
      const value = row ? (row[f.name] ?? "") : "";
      if (f.type === "textarea") {
        return `<label>${f.label}${f.required ? " *" : ""}</label><textarea name="${f.name}" ${f.required ? "required" : ""}>${escapeHtml(String(value))}</textarea>`;
      }
      return `<label>${f.label}${f.required ? " *" : ""}</label><input type="${f.type}" name="${f.name}" value="${escapeHtml(String(value))}" ${f.required ? "required" : ""}>`;
    })
    .join("");

  form.innerHTML = `
    ${fieldsHtml}
    <div class="form-actions">
      <button type="button" class="cancel-btn" id="cancelFormBtn">Cancel</button>
      <button type="submit" class="save-btn">Save</button>
    </div>
  `;
  document.getElementById("cancelFormBtn").addEventListener("click", closeModal);
  form.onsubmit = async (e) => {
    e.preventDefault();
    const payload = {};
    cfg.fields.forEach((f) => {
      const val = form.elements[f.name].value;
      payload[f.name] = f.type === "number" ? (val === "" ? null : Number(val)) : val;
    });
    if (!cfg.noEditionFilter) payload.edition_id = Number(state.editionId);

    try {
      if (row) {
        await apiFetch(`${cfg.endpoint}/${row[cfg.idField]}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await apiFetch(cfg.endpoint, { method: "POST", body: JSON.stringify(payload) });
      }
      closeModal();
      renderSection();
    } catch (err) { alert(err.message); }
  };

  document.getElementById("modalOverlay").classList.add("open");
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  state.editRow = null;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}
