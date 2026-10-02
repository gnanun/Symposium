/* ============================================================
   SYMPOSIUM 2.0 — LIVE DATA INTEGRATION
   Connects the static pages to the real backend API.
   Relies on SYMPOSIUM_API_BASE_URL and apiGet() from script.js
   (loaded before this file on every page) — nothing to edit here.
   Until the backend is reachable, pages silently keep their
   existing placeholder content — nothing breaks either way.
   ============================================================ */

document.addEventListener("DOMContentLoaded", loadLiveData);

/** Slim top-of-page loading bar — shown while live content loads, hidden once done. */
function showLoadingBar() {
  const bar = document.createElement("div");
  bar.id = "pageLoadingBar";
  document.body.appendChild(bar);
  // Two-stage animation: jump to ~70% quickly (feels responsive), then
  // the real completion (see hideLoadingBar) finishes it to 100%.
  requestAnimationFrame(() => { bar.style.width = "70%"; });
  return bar;
}
function hideLoadingBar(bar) {
  if (!bar) return;
  bar.style.width = "100%";
  bar.classList.add("done");
  setTimeout(() => bar.remove(), 500);
}

async function loadLiveData() {
  const loadingBar = showLoadingBar();
  try {
    const editions = await apiGet("/api/editions");
    if (!editions.length) return;
    const current = editions.find((e) => e.is_current) || editions[editions.length - 1];

    // Update countdown/seats config with real values, then re-run those widgets
    if (typeof CONFIG !== "undefined") {
      if (current.event_date) CONFIG.EVENT_DATE = current.event_date + "T09:00:00";
    }

    await Promise.allSettled([
      renderFooterContact(current.edition_id),
      renderJourney(editions),
      renderFeaturedEvents(current.edition_id),
      renderEventsGrid(current.edition_id),
      renderFaqs(current.edition_id),
      renderSchedule(current.edition_id),
      renderCommittee(current.edition_id),
      renderMembers(current.edition_id),
      renderGallery(current.edition_id),
      renderPreviousEditions(editions),
      renderRegistrationHub(current.edition_id),
      renderLiveUpdatesFeeds(current.edition_id),
      renderTestimonials(current.edition_id),
      renderTravelInfo(current.edition_id),
      renderCodeOfConduct(current.edition_id),
      renderReceipt(),
      renderEventDetail(),
      renderDownloadsPage(current.edition_id),
      renderMembersPage(current.edition_id),
      renderAchievementsPage(current.edition_id),
      renderSponsorsPage(current.edition_id),
      renderRecapPage(current.edition_id),
    ]);

    if (typeof initCountdown === "function") initCountdown();
    if (typeof initSeatsBar === "function") initSeatsBar();
    if (typeof initReveal === "function") initReveal();
    if (typeof initAccordion === "function") initAccordion();
    if (typeof initGalleryLightbox === "function") initGalleryLightbox();
  } catch (err) {
    console.warn("Symposium 2.0: live backend not reachable — showing placeholder content instead.", err);
  } finally {
    hideLoadingBar(loadingBar);
  }
}

// ---------- Footer contact (every page) ----------
async function renderFooterContact(editionId) {
  const emailEl = document.getElementById("footerEmail");
  const phoneEl = document.getElementById("footerPhone");
  if (!emailEl && !phoneEl) return;
  try {
    const info = await apiGet(`/api/contact-info?edition_id=${editionId}`);
    const c = info[0];
    if (!c) return;
    if (emailEl && c.email) emailEl.textContent = c.email;
    if (phoneEl && c.phone) phoneEl.textContent = c.phone;
  } catch { /* keep placeholder */ }
}

// ---------- Home: journey strip ----------
async function renderJourney(editions) {
  const track = document.getElementById("journeyTrack");
  if (!track) return;
  const sorted = [...editions].sort((a, b) => a.edition_number - b.edition_number);
  track.innerHTML = sorted
    .map((e) => `
      <div class="journey-node ${e.is_current ? "is-current" : ""}">
        <div class="journey-dot"></div>
        <div class="journey-year">Edition ${e.edition_number} · ${e.event_date ? new Date(e.event_date).getFullYear() : "—"}</div>
        <p class="journey-theme">${escapeHtml(e.theme || "Theme to be announced")}</p>
        <a href="${e.is_current ? "events.html" : "previous-editions.html"}" class="journey-link">${e.is_current ? "See this year's events →" : "View recap →"}</a>
      </div>
    `)
    .join("");
}

// ---------- Home: featured events (first 3) ----------
async function renderFeaturedEvents(editionId) {
  const grid = document.getElementById("featuredEventsGrid");
  if (!grid) return;
  const events = await apiGet(`/api/events?edition_id=${editionId}`);
  if (!events.length) return;
  grid.innerHTML = events
    .slice(0, 3)
    .map((ev, i) => `
      <div class="card card-indexed reveal">
        <span class="card-idx">0${i + 1}</span>
        <div class="card-meta">${ev.category ? `<span class="tag">${escapeHtml(ev.category)}</span>` : ""}</div>
        <h3>${escapeHtml(ev.event_name)}</h3>
        <p>${escapeHtml(ev.description || "")}</p>
        <a href="event-detail.html?id=${ev.event_id}" class="card-link">Details →</a>
      </div>
    `)
    .join("");
}

// ---------- Events page: full grid ----------
async function renderEventsGrid(editionId) {
  const grid = document.getElementById("eventsGrid");
  if (!grid) return;
  const events = await apiGet(`/api/events?edition_id=${editionId}`);
  if (!events.length) return;
  grid.innerHTML = events
    .map((ev) => `
      <div class="card reveal">
        <div class="card-meta">${ev.category ? `<span class="tag">${escapeHtml(ev.category)}</span>` : ""}</div>
        <h3>${escapeHtml(ev.event_name)}</h3>
        <p>${escapeHtml(ev.description || "")}</p>
        <p style="font-size:0.82rem;color:var(--slate-400)">
          ${ev.team_size ? `Team size: ${escapeHtml(ev.team_size)}` : ""}${ev.team_size && ev.duration ? " · " : ""}${ev.duration ? `Duration: ${escapeHtml(ev.duration)}` : ""}
        </p>
        <a href="event-detail.html?id=${ev.event_id}" class="btn btn-outline" style="width:100%; text-align:center; margin-top:0.8rem;">View Details</a>
      </div>
    `)
    .join("");
}

// ---------- Events page: FAQ accordion ----------
async function renderFaqs(editionId) {
  const container = document.getElementById("faqAccordion");
  if (!container) return;
  const faqs = await apiGet(`/api/faqs?edition_id=${editionId}`);
  if (!faqs.length) return;
  container.innerHTML = faqs
    .map((f) => `
      <div class="accordion-item">
        <button class="accordion-q">${escapeHtml(f.question)} <span class="icon">+</span></button>
        <div class="accordion-a">${escapeHtml(f.answer)}</div>
      </div>
    `)
    .join("");
}

// ---------- Schedule page ----------
async function renderSchedule(editionId) {
  const container = document.getElementById("scheduleTimeline");
  if (!container) return;
  const items = await apiGet(`/api/schedule?edition_id=${editionId}`);
  if (!items.length) return;
  const itemsHtml = items
    .map((it) => `
      <div class="timeline-item">
        <div class="timeline-time">${it.start_time ? formatTime(it.start_time) : ""}</div>
        <div class="timeline-title">${escapeHtml(it.item_title)}</div>
        <div class="timeline-loc">${escapeHtml(it.location || "")}</div>
      </div>
    `)
    .join("");
  container.innerHTML = `<div class="timeline-day"><h3>Symposium Day Schedule</h3>${itemsHtml}</div>`;
}

// ---------- Committee page ----------
async function renderCommittee(editionId) {
  const grid = document.getElementById("facultyGrid");
  if (!grid) return;
  const rows = await apiGet(`/api/committee?edition_id=${editionId}`);
  if (!rows.length) return;
  grid.innerHTML = rows.map(personCard).join("");
}

async function renderMembers(editionId) {
  const grid = document.getElementById("studentGrid");
  if (!grid) return;
  const rows = await apiGet(`/api/members?edition_id=${editionId}`);
  if (!rows.length) return;
  grid.innerHTML = rows.map(personCard).join("");
}

function personCard(p) {
  const initials = (p.full_name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return `
    <div class="card person-card reveal">
      <div class="person-photo">${initials}</div>
      <h3>${escapeHtml(p.full_name)}</h3>
      <div class="person-role">${escapeHtml(p.designation)}</div>
      <div class="person-dept">Dept. of CSE, SIET</div>
    </div>
  `;
}

// ---------- Gallery page ----------
async function renderGallery(editionId) {
  const grid = document.getElementById("galleryGrid");
  if (!grid) return;
  const items = await apiGet(`/api/gallery?edition_id=${editionId}`);
  if (!items.length) return;
  grid.innerHTML = items
    .map((g) => `<div class="gallery-item" data-caption="${escapeHtml(g.caption || "")}"><span>${escapeHtml(g.caption || "Photo")}</span></div>`)
    .join("");
}

// ---------- Previous Editions page ----------
async function renderPreviousEditions(editions) {
  const container = document.getElementById("editionsContainer");
  if (!container) return;
  const sorted = [...editions].sort((a, b) => a.edition_number - b.edition_number);
  container.innerHTML = sorted
    .map((e) => `
      <div class="card reveal" style="margin-bottom:var(--sp-4); ${e.is_current ? "border-color:var(--cyan-100)" : ""}">
        <div class="card-meta"><span class="tag">Edition ${e.edition_number} · ${e.event_date ? new Date(e.event_date).getFullYear() : "—"}</span></div>
        <h3>${escapeHtml(e.edition_name)}${e.is_current ? " — Current Edition" : ""}</h3>
        <p>${escapeHtml(e.theme || "")}</p>
        <a href="${e.is_current ? "events.html" : "gallery.html"}" class="card-link mt-2" style="display:inline-block">${e.is_current ? "See this year's events →" : "View photos in Gallery →"}</a>
      </div>
    `)
    .join("");
}

// ---------- Registration page + Home CTA ----------
/** Populates whichever live-update containers exist on the current page (Home teaser, Events teaser, full Live Updates list). */
async function renderLiveUpdatesFeeds(editionId) {
  const targets = [
    { id: "homeLiveUpdatesFeed", limit: 3 },
    { id: "eventsLiveUpdatesFeed", limit: 3 },
    { id: "liveUpdatesFeed", limit: 50 },
  ].filter((t) => document.getElementById(t.id));
  if (!targets.length) return;

  try {
    const updates = await apiGet(`/api/live-updates?edition_id=${editionId}`);
    updates.sort((a, b) => new Date(b.posted_at) - new Date(a.posted_at));

    targets.forEach(({ id, limit }) => {
      const container = document.getElementById(id);
      if (!updates.length) return; // keep the existing "no updates yet" placeholder
      container.innerHTML = updates.slice(0, limit).map((u) => `
        <div class="live-update-item">
          <span class="live-update-time">${new Date(u.posted_at).toLocaleString([], { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
          <p>${escapeHtml(u.update_text)}</p>
        </div>`).join("");
    });
  } catch (err) { /* leave placeholder content in place */ }
}

// ---------- Individual Event Detail page ----------
async function renderEventDetail() {
  const titleEl = document.getElementById("eventTitle");
  if (!titleEl) return; // not on this page

  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("id");
  if (!eventId) return;

  try {
    const event = await apiGet(`/api/events/${eventId}`);
    document.title = `${event.event_name} — Symposium 2.0`;
    document.getElementById("eventBreadcrumbName").textContent = event.event_name;
    titleEl.textContent = event.event_name;
    document.getElementById("eventTagline").textContent = [event.category, event.team_size ? "Team-based" : null, "SIET, Tumakuru"].filter(Boolean).join(" · ");
    document.getElementById("eventDescription").textContent = event.description || document.getElementById("eventDescription").textContent;
    if (event.rules) {
      document.getElementById("eventRules").innerHTML = event.rules.split("\n").filter(Boolean).map((r) => `<li>${escapeHtml(r)}</li>`).join("");
    }
    document.getElementById("eventTeamSize").textContent = event.team_size || "To be announced";
    document.getElementById("eventPrize").textContent = event.coordinator_contact ? event.coordinator_contact : "To be announced";
    document.getElementById("eventCoordinator").textContent = event.coordinator_name || "To be announced";

    // Wire the sidebar Register button to this specific event's registration form
    const regBtn = document.getElementById("eventDetailRegisterBtn");
    if (regBtn) regBtn.href = `registration-form.html?event=${event.event_id}`;

    // Judges — respect the is_revealed flag (revealed live, not published early)
    const judges = await apiGet(`/api/judges?event_id=${event.event_id}`);
    const revealed = judges.filter((j) => j.is_revealed);
    if (revealed.length) {
      const judgesHtml = revealed.map((j) => `
        <div class="card" style="margin-bottom:0.8rem;">
          <strong>${escapeHtml(j.full_name)}</strong>
          ${j.designation ? `<p style="font-size:0.85rem;color:var(--slate-400);">${escapeHtml(j.designation)}${j.organisation ? `, ${escapeHtml(j.organisation)}` : ""}</p>` : ""}
        </div>`).join("");
      document.getElementById("judgesHeading").insertAdjacentHTML("afterend", judgesHtml);
      document.getElementById("judgesRevealNotice")?.remove();
    }

    const themeRows = await apiGet(`/api/theme-reveal?event_id=${event.event_id}`);
    const theme = themeRows[0];
    if (theme && theme.is_revealed && theme.reveal_content) {
      document.getElementById("themeRevealSection").innerHTML = `<p>${escapeHtml(theme.reveal_content)}</p>`;
    }
  } catch (err) {
    titleEl.textContent = "Event not found";
    document.getElementById("eventDescription").textContent = "This event could not be found. It may have been removed or the link may be incorrect.";
  }
}

// ---------- Downloads page ----------
async function renderDownloadsPage(editionId) {
  const container = document.getElementById("downloadsEventResources");
  if (!container) return;

  const downloads = await apiGet(`/api/downloads?edition_id=${editionId}`);
  if (!downloads.length) return; // keep static placeholder cards

  // No dedicated category column in the schema — sort by keyword so downloads
  // land in a sensible section without requiring a database change.
  const categorize = (title) => {
    const t = title.toLowerCase();
    if (/certificate|winner|result/.test(t)) return "downloadsPostEventResources";
    if (/schedule|map|guideline|instruction/.test(t)) return "downloadsParticipantResources";
    return "downloadsEventResources";
  };

  const buckets = { downloadsEventResources: [], downloadsParticipantResources: [], downloadsPostEventResources: [] };
  downloads.forEach((d) => buckets[categorize(d.title)].push(d));

  Object.entries(buckets).forEach(([containerId, items]) => {
    if (!items.length) return;
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = items.map((d) => `
      <div class="card download-card">
        <h3>${escapeHtml(d.title)}</h3>
        <p>Uploaded ${new Date(d.uploaded_at).toLocaleDateString()}</p>
        <a href="${escapeHtml(d.file_url)}" target="_blank" rel="noopener" class="btn btn-primary" style="width:100%;text-align:center;">Download</a>
      </div>
    `).join("");
  });
}

// ---------- Members & Designations page ----------
async function renderMembersPage(editionId) {
  const grid = document.getElementById("membersGrid");
  if (!grid) return;
  const members = await apiGet(`/api/members?edition_id=${editionId}`);
  if (!members.length) return;
  grid.innerHTML = members.map((m) => `
    <div class="card team-card">
      ${m.photo_url ? `<img src="${escapeHtml(m.photo_url)}" alt="${escapeHtml(m.full_name)}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;margin:0 auto var(--sp-2);display:block;">` : `<div class="avatar-placeholder">${escapeHtml(m.full_name.split(" ").map((n) => n[0]).slice(0, 2).join(""))}</div>`}
      <h3>${escapeHtml(m.full_name)}</h3>
      <p>${escapeHtml(m.designation)}</p>
    </div>
  `).join("");
}

// ---------- Achievements page ----------
async function renderAchievementsPage(editionId) {
  const grid = document.getElementById("achievementsGrid");
  if (!grid) return;
  const items = await apiGet(`/api/achievements?edition_id=${editionId}`);
  if (!items.length) return;
  grid.innerHTML = items.map((a) => `
    <div class="card">
      <h3>${escapeHtml(a.title)}</h3>
      <p style="font-size:0.88rem;color:var(--slate-600);">${escapeHtml(a.description || "")}</p>
      ${a.achieved_at ? `<p style="font-size:0.78rem;color:var(--slate-400);margin-top:0.4rem;">${new Date(a.achieved_at).toLocaleDateString()}</p>` : ""}
    </div>
  `).join("");
}

// ---------- Sponsors page ----------
async function renderSponsorsPage(editionId) {
  const inviteCard = document.getElementById("sponsorsInviteCard");
  if (!inviteCard) return; // not on this page

  const sponsors = await apiGet(`/api/sponsors?edition_id=${editionId}`);
  if (!sponsors.length) return; // keep the "interested in sponsoring" invite card

  const grouped = {};
  sponsors.forEach((s) => { (grouped[s.tier || "Partner"] = grouped[s.tier || "Partner"] || []).push(s); });

  const html = Object.entries(grouped).map(([tier, list]) => `
    <h2>${escapeHtml(tier)}</h2>
    <div class="grid grid-3 mt-2 mb-4">
      ${list.map((s) => `
        <div class="card text-center">
          ${s.logo_url ? `<img src="${escapeHtml(s.logo_url)}" alt="${escapeHtml(s.sponsor_name)}" style="max-height:60px;margin:0 auto 0.6rem;">` : ""}
          <h3>${escapeHtml(s.sponsor_name)}</h3>
          ${s.website_url ? `<a href="${escapeHtml(s.website_url)}" target="_blank" rel="noopener" class="card-link">Visit →</a>` : ""}
        </div>
      `).join("")}
    </div>
  `).join("");

  document.getElementById("sponsorsDemoFlag")?.remove();
  inviteCard.insertAdjacentHTML("afterend", html);
  inviteCard.remove();
}

// ---------- Symposium Recap page ----------
async function renderRecapPage(editionId) {
  const el = document.getElementById("recapContent");
  if (!el) return;
  try {
    const recaps = await apiGet(`/api/recaps?edition_id=${editionId}`);
    const recap = recaps[0];
    if (!recap || !recap.published_at) return; // keep placeholder — not published yet
    document.getElementById("recapDemoFlag")?.remove();
    const summaryEl = el.querySelector("p");
    if (summaryEl && recap.summary) summaryEl.textContent = recap.summary;
    if (recap.highlight_video_url) {
      el.insertAdjacentHTML("beforeend", `<h2 class="mt-4">Highlight Video</h2><a href="${escapeHtml(recap.highlight_video_url)}" target="_blank" rel="noopener" class="btn btn-primary">Watch Highlights</a>`);
    }
  } catch (err) { /* keep placeholder */ }
}

async function renderTravelInfo(editionId) {
  const container = document.getElementById("travelSections");
  if (!container) return;
  const sections = await apiGet(`/api/travel-info?edition_id=${editionId}`);
  if (!sections.length) return; // keep placeholder
  document.getElementById("travelDemoFlag")?.remove();
  container.innerHTML = sections.map((s) => `<h2 class="mt-4">${escapeHtml(s.heading)}</h2><p>${escapeHtml(s.content)}</p>`).join("");
}

async function renderCodeOfConduct(editionId) {
  const container = document.getElementById("conductContent");
  if (!container) return;
  const rows = await apiGet(`/api/code-of-conduct?edition_id=${editionId}`);
  if (!rows.length) return; // keep placeholder
  document.getElementById("conductDemoFlag")?.remove();
  container.innerHTML = `<p>${escapeHtml(rows[0].content)}</p>`;
}

async function renderTestimonials(editionId) {
  const grid = document.getElementById("testimonialsGrid");
  if (!grid) return;
  const items = await apiGet(`/api/testimonials?edition_id=${editionId}`);
  const real = items.filter((t) => !t.is_demo);
  if (!real.length) return; // keep demo placeholders
  document.getElementById("testimonialsDemoFlag")?.remove();
  grid.innerHTML = real.map((t) => `
    <div class="card">
      <p style="font-style:italic">"${escapeHtml(t.quote)}"</p>
      <p style="font-size:0.85rem;color:var(--slate-400);margin-top:0.6rem;">— ${escapeHtml(t.author_name)}${t.author_college ? `, ${escapeHtml(t.author_college)}` : ""}</p>
    </div>
  `).join("");
}

async function renderRegistrationHub(editionId) {
  const grid = document.getElementById("registrationHubGrid");
  if (!grid) return;

  const STATUS_LABELS = {
    open: "Open", coming_soon: "Coming Soon", not_set: "Coming Soon",
    paused: "Paused", closed: "Closed", full: "Full",
  };

  try {
    const events = await apiGet(`/api/events?edition_id=${editionId}`);
    if (!events.length) {
      grid.innerHTML = `<div class="card"><p>No events published yet — check back soon.</p></div>`;
      return;
    }

    const cards = await Promise.all(events.map(async (ev) => {
      let settings = null;
      try {
        const rows = await apiGet(`/api/event-registration-settings?event_id=${ev.event_id}`);
        settings = rows[0] || null;
      } catch (e) { /* no settings yet — treat as not_set */ }

      const status = settings?.status || "not_set";
      const label = STATUS_LABELS[status] || "Coming Soon";
      const canRegister = status === "open";
      const seatsNote = settings && (status === "open" || status === "full")
        ? `<p class="seats-note">${settings.seats_registered} / ${settings.seats_total} seats filled</p>`
        : "";

      const cta = canRegister
        ? `<a href="registration-form.html?event=${ev.event_id}" class="btn btn-primary">Register Now</a>`
        : `<span class="btn btn-outline" style="opacity:0.6; pointer-events:none;">${escapeHtml(label)}</span>`;

      return `
        <div class="card reg-hub-card reveal">
          <span class="status-badge ${status}">${escapeHtml(label)}</span>
          <h3>${escapeHtml(ev.event_name)}</h3>
          <p style="font-size:0.88rem; color:var(--slate-600);">${escapeHtml(ev.description || "")}</p>
          ${seatsNote}
          ${cta}
        </div>`;
    }));

    grid.innerHTML = cards.join("");
  } catch (err) {
    grid.innerHTML = `<div class="card"><p>Could not load registration status right now — please try again shortly.</p></div>`;
  }
}

/** Renders a registration receipt into #receiptContainer on thank-you.html, using ?id= from the URL. */
async function renderReceipt() {
  const container = document.getElementById("receiptContainer");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {
    container.innerHTML = `<p>No registration ID was provided. If you just registered, please use the link from your confirmation screen.</p>`;
    return;
  }

  try {
    const reg = await apiGet(`/api/registrations/${encodeURIComponent(id)}`);
    const answersHtml = (reg.answers || [])
      .map((a) => `<li><strong>${escapeHtml(a.field_label)}:</strong> ${escapeHtml(a.answer_value)}</li>`)
      .join("");
    const membersHtml = (reg.team_members || [])
      .map((m) => `<li>${escapeHtml(m.member_name)}${m.member_email ? ` — ${escapeHtml(m.member_email)}` : ""}</li>`)
      .join("");

    container.innerHTML = `
      <p style="font-family:var(--font-mono); font-size:1.3rem; color:var(--cyan-500); font-weight:700;">${escapeHtml(reg.registration_id)}</p>
      <ul class="info-list">
        <li><strong>Event:</strong> <span>${escapeHtml(reg.event_name)}</span></li>
        ${reg.team_name ? `<li><strong>Team:</strong> <span>${escapeHtml(reg.team_name)}</span></li>` : ""}
        <li><strong>Payment Status:</strong> <span>${reg.payment_status === "paid" ? "Paid" : "Verification Pending"}</span></li>
        <li><strong>Submitted:</strong> <span>${new Date(reg.submitted_at).toLocaleString()}</span></li>
      </ul>
      ${answersHtml ? `<h4 style="margin-top:1rem;">Details</h4><ul class="check-list">${answersHtml}</ul>` : ""}
      ${membersHtml ? `<h4 style="margin-top:1rem;">Team Members</h4><ul class="check-list">${membersHtml}</ul>` : ""}
      <div style="display:flex; gap:0.6rem; margin-top:1.2rem;">
        <button class="btn btn-primary" onclick="window.print()" style="flex:1;">Print</button>
        <button class="btn btn-outline" onclick="downloadReceiptText()" style="flex:1;">Download</button>
      </div>
    `;
    window._receiptData = reg;
  } catch (err) {
    container.innerHTML = `<p>We couldn't find a registration with that ID. Please check the link or contact the coordinators.</p>`;
  }
}

function downloadReceiptText() {
  const reg = window._receiptData;
  if (!reg) return;
  const lines = [
    `Symposium 2.0 — Registration Receipt`,
    `Registration ID: ${reg.registration_id}`,
    `Event: ${reg.event_name}`,
    reg.team_name ? `Team: ${reg.team_name}` : null,
    `Payment Status: ${reg.payment_status === "paid" ? "Paid" : "Verification Pending"}`,
    `Submitted: ${new Date(reg.submitted_at).toLocaleString()}`,
  ].filter(Boolean).join("\n");
  const blob = new Blob([lines], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${reg.registration_id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------- Helpers ----------
// escapeHtml is defined in script.js (shared across every page)
function formatTime(dt) {
  const d = new Date(dt);
  if (isNaN(d)) return dt;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
