-- ============================================================
-- SYMPOSIUM 2.0 — DATABASE SCHEMA
-- Engine: MySQL 8+
-- Convention: plural snake_case tables, singular `_id` primary keys
-- Every content table is scoped to a symposium_edition — this is
-- what makes yearly archiving work without data loss or overwrite.
-- ============================================================

CREATE DATABASE IF NOT EXISTS symposium2_db;
USE symposium2_db;

-- ---------- Parent entity: every year's symposium ----------
CREATE TABLE symposium_editions (
  edition_id INT AUTO_INCREMENT PRIMARY KEY,
  edition_number INT NOT NULL,              -- 1, 2, 3...
  edition_name VARCHAR(120) NOT NULL,        -- e.g. "Symposium 2.0"
  theme VARCHAR(160),
  event_date DATE,                           -- nullable until officially confirmed
  is_current BOOLEAN DEFAULT FALSE,          -- only one edition should be TRUE at a time
  status ENUM('upcoming','ongoing','completed','archived') DEFAULT 'upcoming',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------- Admin accounts (2-3 equal-permission accounts) ----------
CREATE TABLE admin_accounts (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  username VARCHAR(60) UNIQUE NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,       -- bcrypt hash, never plain text
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL
);

-- ---------- Events ----------
CREATE TABLE events (
  event_id INT AUTO_INCREMENT PRIMARY KEY,
  edition_id INT NOT NULL,
  event_name VARCHAR(120) NOT NULL,
  category VARCHAR(60),                      -- Coding / Hardware / Ideation / Design / Gaming / Quiz / Workshop
  description TEXT,
  rules TEXT,
  team_size VARCHAR(40),
  duration VARCHAR(40),
  coordinator_name VARCHAR(100),
  coordinator_contact VARCHAR(60),
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (edition_id) REFERENCES symposium_editions(edition_id) ON DELETE CASCADE
);

-- ---------- Schedule ----------
CREATE TABLE schedule_items (
  schedule_id INT AUTO_INCREMENT PRIMARY KEY,
  edition_id INT NOT NULL,
  event_id INT NULL,                         -- optional link to a specific event
  item_title VARCHAR(150) NOT NULL,
  start_time DATETIME,
  end_time DATETIME,
  location VARCHAR(150),
  display_order INT DEFAULT 0,
  FOREIGN KEY (edition_id) REFERENCES symposium_editions(edition_id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE SET NULL
);

-- ---------- Downloads ----------
CREATE TABLE downloads (
  download_id INT AUTO_INCREMENT PRIMARY KEY,
  edition_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,               -- e.g. "Brochure", "Rulebook"
  file_url VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (edition_id) REFERENCES symposium_editions(edition_id) ON DELETE CASCADE
);

-- ---------- Gallery ----------
CREATE TABLE gallery_items (
  gallery_id INT AUTO_INCREMENT PRIMARY KEY,
  edition_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  caption VARCHAR(200),
  display_order INT DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (edition_id) REFERENCES symposium_editions(edition_id) ON DELETE CASCADE
);

-- ---------- Announcements (general, non-live) ----------
CREATE TABLE announcements (
  announcement_id INT AUTO_INCREMENT PRIMARY KEY,
  edition_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (edition_id) REFERENCES symposium_editions(edition_id) ON DELETE CASCADE
);

-- ---------- Live Updates (separate from announcements; becomes historical after event) ----------
CREATE TABLE live_updates (
  update_id INT AUTO_INCREMENT PRIMARY KEY,
  edition_id INT NOT NULL,
  update_text TEXT NOT NULL,
  posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (edition_id) REFERENCES symposium_editions(edition_id) ON DELETE CASCADE
);

-- ---------- FAQ ----------
CREATE TABLE faqs (
  faq_id INT AUTO_INCREMENT PRIMARY KEY,
  edition_id INT NOT NULL,
  question VARCHAR(250) NOT NULL,
  answer TEXT NOT NULL,
  display_order INT DEFAULT 0,
  FOREIGN KEY (edition_id) REFERENCES symposium_editions(edition_id) ON DELETE CASCADE
);

-- ---------- Organising Committee (faculty) ----------
CREATE TABLE committee_members (
  committee_id INT AUTO_INCREMENT PRIMARY KEY,
  edition_id INT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  designation VARCHAR(100) NOT NULL,          -- e.g. "Faculty Coordinator"
  photo_url VARCHAR(255),
  display_order INT DEFAULT 0,
  FOREIGN KEY (edition_id) REFERENCES symposium_editions(edition_id) ON DELETE CASCADE
);

-- ---------- Members & Designations (student core team) ----------
CREATE TABLE members (
  member_id INT AUTO_INCREMENT PRIMARY KEY,
  edition_id INT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  designation VARCHAR(100) NOT NULL,          -- e.g. "Secretary", "Tech Lead"
  photo_url VARCHAR(255),
  display_order INT DEFAULT 0,
  FOREIGN KEY (edition_id) REFERENCES symposium_editions(edition_id) ON DELETE CASCADE
);

-- ---------- Sponsors ----------
CREATE TABLE sponsors (
  sponsor_id INT AUTO_INCREMENT PRIMARY KEY,
  edition_id INT NOT NULL,
  sponsor_name VARCHAR(120) NOT NULL,
  logo_url VARCHAR(255),
  tier VARCHAR(50),                           -- e.g. Title / Gold / Silver
  website_url VARCHAR(255),
  display_order INT DEFAULT 0,
  FOREIGN KEY (edition_id) REFERENCES symposium_editions(edition_id) ON DELETE CASCADE
);

-- ---------- Achievements ----------
CREATE TABLE achievements (
  achievement_id INT AUTO_INCREMENT PRIMARY KEY,
  edition_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  achieved_at DATE,
  FOREIGN KEY (edition_id) REFERENCES symposium_editions(edition_id) ON DELETE CASCADE
);

-- ---------- Symposium Recap (post-event wrap-up) ----------
CREATE TABLE recaps (
  recap_id INT AUTO_INCREMENT PRIMARY KEY,
  edition_id INT NOT NULL UNIQUE,
  summary TEXT,
  highlight_video_url VARCHAR(255),
  published_at TIMESTAMP NULL,
  FOREIGN KEY (edition_id) REFERENCES symposium_editions(edition_id) ON DELETE CASCADE
);

-- ---------- Contact Info (edition-scoped so old years keep accurate info) ----------
CREATE TABLE contact_info (
  contact_id INT AUTO_INCREMENT PRIMARY KEY,
  edition_id INT NOT NULL UNIQUE,
  email VARCHAR(120),
  phone VARCHAR(30),
  address VARCHAR(255),
  instagram_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  youtube_url VARCHAR(255),
  FOREIGN KEY (edition_id) REFERENCES symposium_editions(edition_id) ON DELETE CASCADE
);

-- ---------- Registration (status + external form, not a form processor) ----------
-- DEPRECATED in V2: registration now happens on-site, per event (see event_registration_settings
-- below). Table kept only so existing edition rows aren't orphaned; no longer written to by V2 code.
CREATE TABLE registration_settings (
  registration_id INT AUTO_INCREMENT PRIMARY KEY,
  edition_id INT NOT NULL UNIQUE,
  is_open BOOLEAN DEFAULT FALSE,
  external_form_url VARCHAR(255),
  seats_total INT DEFAULT 100,
  seats_registered INT DEFAULT 0,
  deadline DATETIME,
  FOREIGN KEY (edition_id) REFERENCES symposium_editions(edition_id) ON DELETE CASCADE
);

-- ============================================================
-- V2 ADDITIONS — On-site Registration Module
-- One registration form per event. Fields are fully dynamic
-- (admin-defined per event), so adding/removing events or their
-- fields in future editions never requires a schema or code change.
-- ============================================================

-- ---------- Per-event registration configuration ----------
CREATE TABLE event_registration_settings (
  event_reg_id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL UNIQUE,
  status ENUM('not_set','coming_soon','open','paused','closed','full') DEFAULT 'not_set',
  team_size_min INT DEFAULT 1,
  team_size_max INT DEFAULT 1,
  fee_amount DECIMAL(10,2) DEFAULT 0.00,
  qr_code_url VARCHAR(255),                  -- admin-uploaded UPI QR image for this event
  seats_total INT DEFAULT 100,
  seats_registered INT DEFAULT 0,            -- kept in sync by the backend on each successful registration
  deadline DATETIME,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

-- ---------- Dynamic form fields, admin-defined per event ----------
CREATE TABLE registration_fields (
  field_id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  field_label VARCHAR(120) NOT NULL,         -- e.g. "College Name", "USN"
  field_type ENUM('short_text','long_text','email','phone','number','dropdown','radio','checkbox','date','url','file') NOT NULL,
  field_options TEXT,                        -- JSON array for dropdown/radio/checkbox choices; NULL otherwise
  is_required BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,               -- order they were added in = order shown; admin sets this by add sequence
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

-- ---------- One row per successful registration submission ----------
CREATE TABLE registrations (
  registration_id VARCHAR(20) PRIMARY KEY,   -- generated code, e.g. SYM2-HACK-0042, never reused
  event_id INT NOT NULL,
  team_name VARCHAR(120),                    -- NULL for individual-only events
  payment_status ENUM('verification_pending','paid') DEFAULT 'verification_pending',
  payment_screenshot_url VARCHAR(255) NOT NULL,
  utr_number VARCHAR(60) NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

-- ---------- Answers to each event's dynamic fields, one row per field per registration ----------
CREATE TABLE registration_answers (
  answer_id INT AUTO_INCREMENT PRIMARY KEY,
  registration_id VARCHAR(20) NOT NULL,
  field_id INT NOT NULL,
  answer_value TEXT,
  FOREIGN KEY (registration_id) REFERENCES registrations(registration_id) ON DELETE CASCADE,
  FOREIGN KEY (field_id) REFERENCES registration_fields(field_id) ON DELETE CASCADE,
  INDEX idx_registration (registration_id)
);

-- ---------- Team members beyond the primary registrant (team-based events only) ----------
CREATE TABLE team_members (
  team_member_id INT AUTO_INCREMENT PRIMARY KEY,
  registration_id VARCHAR(20) NOT NULL,
  member_name VARCHAR(100) NOT NULL,
  member_email VARCHAR(120),
  member_phone VARCHAR(30),
  member_usn VARCHAR(40),
  FOREIGN KEY (registration_id) REFERENCES registrations(registration_id) ON DELETE CASCADE
);

-- Indexes supporting the admin dashboard's duplicate-detection and search (email/phone/USN
-- live inside registration_answers as dynamic field values, so duplicate checks query by
-- field_id + answer_value; this index keeps that fast).
CREATE INDEX idx_answer_value ON registration_answers (field_id, answer_value(100));

-- ============================================================
-- V2 ADDITIONS — New content sections
-- ============================================================

-- ---------- Judges / Mentors (revealed live, not published in advance) ----------
CREATE TABLE judges (
  judge_id INT AUTO_INCREMENT PRIMARY KEY,
  edition_id INT NOT NULL,
  event_id INT NULL,                         -- NULL = general/keynote judge, otherwise tied to one event
  full_name VARCHAR(100) NOT NULL,
  designation VARCHAR(150),
  organisation VARCHAR(150),
  photo_url VARCHAR(255),
  is_revealed BOOLEAN DEFAULT FALSE,          -- flips to TRUE by admin during the event
  display_order INT DEFAULT 0,
  FOREIGN KEY (edition_id) REFERENCES symposium_editions(edition_id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE SET NULL
);

-- ---------- Testimonials ----------
CREATE TABLE testimonials (
  testimonial_id INT AUTO_INCREMENT PRIMARY KEY,
  edition_id INT NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  author_college VARCHAR(150),
  quote TEXT NOT NULL,
  photo_url VARCHAR(255),
  is_demo BOOLEAN DEFAULT TRUE,               -- TRUE until swapped for a real submitted quote
  display_order INT DEFAULT 0,
  FOREIGN KEY (edition_id) REFERENCES symposium_editions(edition_id) ON DELETE CASCADE
);

-- ---------- Travel & Accommodation info (edition-scoped, free-form sections) ----------
CREATE TABLE travel_info_sections (
  section_id INT AUTO_INCREMENT PRIMARY KEY,
  edition_id INT NOT NULL,
  heading VARCHAR(150) NOT NULL,             -- e.g. "By Train", "Nearby Stay Options"
  content TEXT NOT NULL,
  display_order INT DEFAULT 0,
  FOREIGN KEY (edition_id) REFERENCES symposium_editions(edition_id) ON DELETE CASCADE
);

-- ---------- Code of Conduct (edition-scoped, versioned so old editions keep their exact wording) ----------
CREATE TABLE code_of_conduct (
  conduct_id INT AUTO_INCREMENT PRIMARY KEY,
  edition_id INT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (edition_id) REFERENCES symposium_editions(edition_id) ON DELETE CASCADE
);

-- ---------- Theme / problem-statement reveal (flexible — works whether fixed or open-ended) ----------
CREATE TABLE theme_reveal (
  theme_reveal_id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL UNIQUE,
  is_revealed BOOLEAN DEFAULT FALSE,
  reveal_content TEXT,                        -- filled in by admin once decided/revealed; NULL until then
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

-- ============================================================
-- Seed: create the first two editions so the site has real rows
-- to read from immediately (matches the placeholder frontend).
-- ============================================================
INSERT INTO symposium_editions (edition_number, edition_name, theme, event_date, is_current, status)
VALUES
  (1, 'Symposium 1.0', 'EDIT: real theme from Edition 1', '2025-09-20', FALSE, 'completed'),
  (2, 'Symposium 2.0', 'EDIT: this year\'s theme', '2026-09-26', TRUE, 'upcoming');

INSERT INTO registration_settings (edition_id, is_open, external_form_url, seats_total, seats_registered, deadline)
VALUES (2, TRUE, 'https://forms.gle/EDIT-THIS-LINK', 100, 41, '2026-09-19 23:59:59');
