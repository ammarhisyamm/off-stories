PRAGMA foreign_keys = ON;

CREATE TABLE growth_events (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL CHECK (event_name IN (
    'seo_page_view', 'seo_cta_click', 'signup_started', 'signup_completed',
    'workspace_created', 'wedding_date_added', 'first_checklist_action',
    'budget_created', 'guest_added', 'vendor_added', 'partner_invited'
  )),
  user_source TEXT NOT NULL DEFAULT 'unknown' CHECK (user_source IN ('organic', 'referral', 'direct', 'paid', 'unknown')),
  landing_page TEXT,
  content_cluster TEXT,
  cta_variant TEXT,
  meta TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX growth_events_by_session ON growth_events(session_id, created_at);
CREATE INDEX growth_events_by_user ON growth_events(user_id, created_at);
CREATE INDEX growth_events_by_source_event ON growth_events(user_source, event_name, created_at);
