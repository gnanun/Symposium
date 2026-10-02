// ============================================================
// Registration form (registration-form.html only).
// Loads the event's real, admin-defined dynamic fields and
// registration settings from the backend and renders the form
// accordingly — nothing about the field set is hardcoded here.
// ============================================================
document.addEventListener("DOMContentLoaded", initRegistrationForm);

let regFormState = { event: null, settings: null, fields: [], teamMemberCount: 0 };

async function initRegistrationForm() {
  const wrapper = document.getElementById("regFormWrapper");
  if (!wrapper) return; // not on this page

  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("event");
  const statusMsg = document.getElementById("regFormStatusMessage");

  if (!eventId) {
    statusMsg.innerHTML = `<div class="demo-flag" style="background:#fee2e2;border-color:#fca5a5;color:#991b1b;">No event was specified. Please go back to <a href="registration.html">Registration</a> and choose an event.</div>`;
    return;
  }

  try {
    const [event, settingsRows, fields] = await Promise.all([
      apiGet(`/api/events/${eventId}`),
      apiGet(`/api/event-registration-settings?event_id=${eventId}`),
      apiGet(`/api/registration-fields?event_id=${eventId}`),
    ]);
    const settings = settingsRows[0] || null;
    regFormState = { event, settings, fields, teamMemberCount: 0 };

    document.getElementById("regFormEventName").textContent = `Register — ${event.event_name}`;
    document.getElementById("regFormEventTagline").textContent = event.category || "";
    document.title = `Register — ${event.event_name} — Symposium 2.0`;

    const status = settings?.status || "not_set";
    if (status === "closed") { window.location.href = "registration-closed.html"; return; }
    if (status === "full") { window.location.href = "registration-full.html"; return; }
    if (status !== "open") {
      const messages = {
        paused: `Registration for <strong>${escapeHtml(event.event_name)}</strong> is temporarily paused — please check back shortly.`,
        coming_soon: `Registration for <strong>${escapeHtml(event.event_name)}</strong> hasn't opened yet — check back soon.`,
        not_set: `Registration for <strong>${escapeHtml(event.event_name)}</strong> hasn't opened yet — check back soon.`,
      };
      statusMsg.innerHTML = `<div class="demo-flag">${messages[status] || messages.not_set}</div>`;
      return;
    }
    if (settings.deadline && new Date() > new Date(settings.deadline)) {
      window.location.href = "registration-closed.html";
      return;
    }

    renderRegistrationForm();
    wrapper.style.display = "";
  } catch (err) {
    statusMsg.innerHTML = `<div class="demo-flag" style="background:#fee2e2;border-color:#fca5a5;color:#991b1b;">Could not load this event's registration. Please try again shortly.</div>`;
  }
}

function renderRegistrationForm() {
  const { event, settings, fields } = regFormState;

  // Event info sidebar
  document.getElementById("regFormEventInfo").innerHTML = `
    <li><strong>Team Size:</strong> <span>${settings.team_size_min}${settings.team_size_max !== settings.team_size_min ? `–${settings.team_size_max}` : ""}</span></li>
    <li><strong>Fee:</strong> <span>₹${Number(settings.fee_amount).toFixed(0)}</span></li>
    <li><strong>Seats:</strong> <span>${settings.seats_registered} / ${settings.seats_total}</span></li>
    ${settings.deadline ? `<li><strong>Deadline:</strong> <span>${new Date(settings.deadline).toLocaleDateString()}</span></li>` : ""}
  `;

  // Dynamic fields (admin-defined, in the order they were added)
  const fieldsContainer = document.getElementById("regFormDynamicFields");
  fieldsContainer.innerHTML = fields.map(renderDynamicField).join("");

  // Team members
  const isTeamEvent = settings.team_size_max > 1;
  const teamSection = document.getElementById("teamMembersContainer");
  const hint = document.getElementById("teamSizeHint");
  const addBtn = document.getElementById("addTeamMemberBtn");

  if (!isTeamEvent) {
    hint.textContent = "This is an individual event — no team members needed.";
    addBtn.style.display = "none";
  } else {
    document.getElementById("teamNameFieldWrapper").style.display = "";
    document.getElementById("teamNameInput").required = true;
    const minAdditional = Math.max(0, settings.team_size_min - 1);
    const maxAdditional = settings.team_size_max - 1;
    hint.textContent = `Add your teammates (excluding yourself). This event needs ${settings.team_size_min}–${settings.team_size_max} members in total.`;
    for (let i = 0; i < minAdditional; i++) addTeamMemberRow();
    addBtn.onclick = () => {
      if (regFormState.teamMemberCount >= maxAdditional) {
        alert(`This event allows a maximum of ${settings.team_size_max} members per team.`);
        return;
      }
      addTeamMemberRow();
    };
  }

  // QR code + payment
  document.getElementById("qrCodeContainer").innerHTML = settings.qr_code_url
    ? `<img src="${escapeHtml(settings.qr_code_url)}" alt="UPI QR Code" style="max-width:220px; margin:0 auto;"><p style="margin-top:0.6rem; font-weight:600;">Pay ₹${Number(settings.fee_amount).toFixed(0)} via UPI, then fill in the details below.</p>`
    : `<p style="color:var(--slate-400);">QR code not yet uploaded by the organisers — please contact the coordinators for payment details.</p>`;

  document.getElementById("registrationForm").addEventListener("submit", handleRegistrationSubmit);
}

function renderDynamicField(field) {
  const req = field.is_required ? "required" : "";
  const reqStar = field.is_required ? " *" : "";
  const options = field.field_options ? JSON.parse(field.field_options) : [];

  // Radio and multi-option checkbox fields are groups of inputs sharing one label —
  // these need a <fieldset>/<legend>, not a single <label>, for correct screen-reader semantics.
  if (field.field_type === "radio" || (field.field_type === "checkbox" && options.length)) {
    const inputType = field.field_type === "radio" ? "radio" : "checkbox";
    const nameAttr = field.field_type === "radio" ? `field_${field.field_id}` : `field_${field.field_id}[]`;
    const optionsHtml = options.map((o, i) => `
      <label style="display:flex; align-items:center; gap:0.4rem; font-weight:400; margin-bottom:0.3rem;">
        <input type="${inputType}" name="${nameAttr}" value="${escapeHtml(o)}" ${inputType === "radio" && i === 0 ? req : ""}> ${escapeHtml(o)}
      </label>`).join("");
    return `<fieldset class="form-field" data-field-id="${field.field_id}" style="border:none; padding:0; margin:0 0 1.1rem;">
      <legend style="font-weight:500; margin-bottom:0.35rem; padding:0;">${escapeHtml(field.field_label)}${reqStar}</legend>
      ${optionsHtml}
    </fieldset>`;
  }

  let inputHtml;
  switch (field.field_type) {
    case "long_text":
      inputHtml = `<textarea name="field_${field.field_id}" ${req}></textarea>`;
      break;
    case "email":
      inputHtml = `<input type="email" name="field_${field.field_id}" ${req}>`;
      break;
    case "phone":
      inputHtml = `<input type="tel" name="field_${field.field_id}" pattern="[0-9+\\-\\s]{7,15}" ${req}>`;
      break;
    case "number":
      inputHtml = `<input type="number" name="field_${field.field_id}" ${req}>`;
      break;
    case "date":
      inputHtml = `<input type="date" name="field_${field.field_id}" ${req}>`;
      break;
    case "url":
      inputHtml = `<input type="url" name="field_${field.field_id}" placeholder="https://" ${req}>`;
      break;
    case "dropdown":
      inputHtml = `<select name="field_${field.field_id}" ${req}>
        <option value="">Select…</option>
        ${options.map((o) => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join("")}
      </select>`;
      break;
    case "checkbox": // single yes/no checkbox — the multi-option case is handled by the fieldset above
      inputHtml = `<input type="checkbox" name="field_${field.field_id}" ${req}>`;
      break;
    case "file":
      inputHtml = `<input type="file" name="field_${field.field_id}" ${req}>`;
      break;
    default: // short_text
      inputHtml = `<input type="text" name="field_${field.field_id}" ${req}>`;
  }

  return `<label class="form-field" data-field-id="${field.field_id}"><span>${escapeHtml(field.field_label)}${reqStar}</span>${inputHtml}</label>`;
}

function addTeamMemberRow() {
  regFormState.teamMemberCount += 1;
  const idx = regFormState.teamMemberCount;
  const row = document.createElement("div");
  row.className = "team-member-row";
  row.dataset.memberIndex = idx;
  row.innerHTML = `
    <label class="form-field"><span>Name *</span><input type="text" class="member-name" required></label>
    <label class="form-field"><span>Email</span><input type="email" class="member-email"></label>
    <label class="form-field"><span>Phone</span><input type="tel" class="member-phone"></label>
    <button type="button" class="remove-member-btn">Remove</button>
  `;
  row.querySelector(".remove-member-btn").onclick = () => { row.remove(); };
  document.getElementById("teamMembersContainer").appendChild(row);
}

async function handleRegistrationSubmit(e) {
  e.preventDefault();
  const submitBtn = document.getElementById("regSubmitBtn");
  const errorBox = document.getElementById("regFormError");
  errorBox.style.display = "none";

  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting…";

  try {
    // Honeypot check — a real visitor never fills this hidden field; a bot that
    // auto-fills every input on the page will, so silently reject without
    // revealing to the bot that it was caught (fail generically, not loudly).
    const honeypot = document.getElementById("websiteHoneypot");
    if (honeypot && honeypot.value.trim() !== "") {
      throw new Error("Submission could not be processed. Please try again or contact the coordinators.");
    }

    const fileInput = document.getElementById("paymentScreenshotInput");
    if (!fileInput.files.length) throw new Error("Please upload your payment screenshot.");
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB — must match the server-side limit
    if (fileInput.files[0].size > MAX_FILE_SIZE) {
      throw new Error("Your payment screenshot is too large. Maximum size is 5MB — try a compressed screenshot instead of a full-resolution photo.");
    }

    // 1. Upload the payment screenshot first
    const formData = new FormData();
    formData.append("payment_screenshot", fileInput.files[0]);
    const uploadRes = await fetch(`${SYMPOSIUM_API_BASE_URL}/api/uploads/payment-screenshot`, {
      method: "POST", body: formData,
    });
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) throw new Error(uploadData.error || "File upload failed.");

    // 2. Collect dynamic field answers (uploading any file-type fields for real first)
    const answers = {};
    for (const field of regFormState.fields) {
      const el = document.querySelector(`[data-field-id="${field.field_id}"]`);
      if (!el) continue;
      if (field.field_type === "radio") {
        const checked = el.querySelector(`input[name="field_${field.field_id}"]:checked`);
        answers[field.field_id] = checked ? checked.value : "";
      } else if (field.field_type === "checkbox" && el.querySelectorAll(`input[type="checkbox"]`).length > 1) {
        const checked = [...el.querySelectorAll(`input[type="checkbox"]:checked`)].map((c) => c.value);
        answers[field.field_id] = checked.join(", ");
      } else if (field.field_type === "checkbox") {
        answers[field.field_id] = el.querySelector("input").checked ? "Yes" : "";
      } else if (field.field_type === "file") {
        const fieldFile = el.querySelector("input").files[0];
        if (fieldFile) {
          const fieldFormData = new FormData();
          fieldFormData.append("payment_screenshot", fieldFile); // reuses the same generic, validated upload endpoint
          const fieldUploadRes = await fetch(`${SYMPOSIUM_API_BASE_URL}/api/uploads/payment-screenshot`, { method: "POST", body: fieldFormData });
          const fieldUploadData = await fieldUploadRes.json();
          if (!fieldUploadRes.ok) throw new Error(`Could not upload "${field.field_label}": ${fieldUploadData.error}`);
          answers[field.field_id] = fieldUploadData.url;
        } else {
          answers[field.field_id] = "";
        }
      } else {
        answers[field.field_id] = el.querySelector("input, textarea, select")?.value || "";
      }
    }

    // 3. Collect team members
    const teamMembers = [...document.querySelectorAll(".team-member-row")].map((row) => ({
      member_name: row.querySelector(".member-name").value,
      member_email: row.querySelector(".member-email").value,
      member_phone: row.querySelector(".member-phone").value,
    })).filter((m) => m.member_name.trim());

    if (!document.getElementById("conductAgreeCheckbox").checked) {
      throw new Error("You must agree to the Code of Conduct to register.");
    }

    const isTeamEvent = regFormState.settings.team_size_max > 1;
    if (isTeamEvent && !document.getElementById("teamNameInput").value.trim()) {
      throw new Error("Please enter a team name.");
    }

    // 4. Submit the registration
    const payload = {
      event_id: Number(regFormState.event.event_id),
      team_name: isTeamEvent ? document.getElementById("teamNameInput").value.trim() : null,
      answers,
      team_members: teamMembers,
      payment_screenshot_url: uploadData.url,
      utr_number: document.getElementById("utrNumberInput").value,
      website: honeypot ? honeypot.value : "",
    };

    const res = await fetch(`${SYMPOSIUM_API_BASE_URL}/api/registrations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed. Please try again.");

    window.location.href = `thank-you.html?id=${encodeURIComponent(data.registration_id)}`;
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.style.display = "block";
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Registration";
  }
}
