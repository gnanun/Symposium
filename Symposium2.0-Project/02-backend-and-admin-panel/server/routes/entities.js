// ============================================================
// Wires every content type from the schema to its own CRUD
// endpoint using the shared factory. Add new entities here —
// don't write a new route file per entity.
// ============================================================
const createCrudRouter = require('../utils/crudFactory');

const editions = createCrudRouter({
  table: 'symposium_editions',
  idField: 'edition_id',
  fields: ['edition_number', 'edition_name', 'theme', 'event_date', 'is_current', 'status'],
});

const events = createCrudRouter({
  table: 'events',
  idField: 'event_id',
  fields: ['edition_id', 'event_name', 'category', 'description', 'rules', 'team_size', 'duration', 'coordinator_name', 'coordinator_contact', 'display_order'],
});

const schedule = createCrudRouter({
  table: 'schedule_items',
  idField: 'schedule_id',
  fields: ['edition_id', 'event_id', 'item_title', 'start_time', 'end_time', 'location', 'display_order'],
});

const downloads = createCrudRouter({
  table: 'downloads',
  idField: 'download_id',
  fields: ['edition_id', 'title', 'file_url'],
});

const gallery = createCrudRouter({
  table: 'gallery_items',
  idField: 'gallery_id',
  fields: ['edition_id', 'image_url', 'caption', 'display_order'],
});

const announcements = createCrudRouter({
  table: 'announcements',
  idField: 'announcement_id',
  fields: ['edition_id', 'title', 'message'],
});

const liveUpdates = createCrudRouter({
  table: 'live_updates',
  idField: 'update_id',
  fields: ['edition_id', 'update_text'],
});

const faqs = createCrudRouter({
  table: 'faqs',
  idField: 'faq_id',
  fields: ['edition_id', 'question', 'answer', 'display_order'],
});

const committee = createCrudRouter({
  table: 'committee_members',
  idField: 'committee_id',
  fields: ['edition_id', 'full_name', 'designation', 'photo_url', 'display_order'],
});

const members = createCrudRouter({
  table: 'members',
  idField: 'member_id',
  fields: ['edition_id', 'full_name', 'designation', 'photo_url', 'display_order'],
});

const sponsors = createCrudRouter({
  table: 'sponsors',
  idField: 'sponsor_id',
  fields: ['edition_id', 'sponsor_name', 'logo_url', 'tier', 'website_url', 'display_order'],
});

const achievements = createCrudRouter({
  table: 'achievements',
  idField: 'achievement_id',
  fields: ['edition_id', 'title', 'description', 'achieved_at'],
});

const recaps = createCrudRouter({
  table: 'recaps',
  idField: 'recap_id',
  fields: ['edition_id', 'summary', 'highlight_video_url', 'published_at'],
});

const contactInfo = createCrudRouter({
  table: 'contact_info',
  idField: 'contact_id',
  fields: ['edition_id', 'email', 'phone', 'address', 'instagram_url', 'linkedin_url', 'youtube_url'],
});

const registration = createCrudRouter({
  table: 'registration_settings',
  idField: 'registration_id',
  fields: ['edition_id', 'is_open', 'external_form_url', 'seats_total', 'seats_registered', 'deadline'],
});

// ---------- V2 additions ----------

const judges = createCrudRouter({
  table: 'judges',
  idField: 'judge_id',
  fields: ['edition_id', 'event_id', 'full_name', 'designation', 'organisation', 'photo_url', 'is_revealed', 'display_order'],
});

const testimonials = createCrudRouter({
  table: 'testimonials',
  idField: 'testimonial_id',
  fields: ['edition_id', 'author_name', 'author_college', 'quote', 'photo_url', 'is_demo', 'display_order'],
});

const travelInfo = createCrudRouter({
  table: 'travel_info_sections',
  idField: 'section_id',
  fields: ['edition_id', 'heading', 'content', 'display_order'],
});

const codeOfConduct = createCrudRouter({
  table: 'code_of_conduct',
  idField: 'conduct_id',
  fields: ['edition_id', 'content'],
});

const themeReveal = createCrudRouter({
  table: 'theme_reveal',
  idField: 'theme_reveal_id',
  fields: ['event_id', 'is_revealed', 'reveal_content'],
});

const eventRegistrationSettings = createCrudRouter({
  table: 'event_registration_settings',
  idField: 'event_reg_id',
  fields: ['event_id', 'status', 'team_size_min', 'team_size_max', 'fee_amount', 'qr_code_url', 'seats_total', 'seats_registered', 'deadline'],
});

const registrationFields = createCrudRouter({
  table: 'registration_fields',
  idField: 'field_id',
  fields: ['event_id', 'field_label', 'field_type', 'field_options', 'is_required', 'display_order'],
});

module.exports = {
  editions, events, schedule, downloads, gallery, announcements,
  liveUpdates, faqs, committee, members, sponsors, achievements,
  recaps, contactInfo, registration,
  judges, testimonials, travelInfo, codeOfConduct, themeReveal,
  eventRegistrationSettings, registrationFields,
};
