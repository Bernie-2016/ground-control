CREATE FOREIGN TABLE IF NOT EXISTS mysql_bsd_cons_addr(
	cons_addr_id INTEGER NOT NULL,
	cons_id INTEGER NOT NULL,
	cons_addr_type_id INTEGER NOT NULL DEFAULT '0',
	is_primary INTEGER NOT NULL DEFAULT '0',
	addr1 TEXT DEFAULT NULL,
	addr2 TEXT DEFAULT NULL,
	addr3 TEXT DEFAULT NULL,
	city TEXT DEFAULT NULL,
	state_cd TEXT DEFAULT NULL,
	zip TEXT DEFAULT NULL,
	zip_4 TEXT DEFAULT NULL,
	country TEXT DEFAULT NULL,
	addr_aug_ver INTEGER NOT NULL DEFAULT '0',
	addr_aug_dt TIMESTAMP DEFAULT NULL,
	geocoder_accuracy INTEGER DEFAULT NULL,
	create_dt TIMESTAMP DEFAULT NULL,
	create_app TEXT DEFAULT NULL,
	create_user TEXT DEFAULT NULL,
	modified_dt TIMESTAMP DEFAULT NULL,
	modified_app TEXT DEFAULT NULL,
	modified_user TEXT DEFAULT NULL,
	status INTEGER NOT NULL DEFAULT '1',
	note TEXT DEFAULT NULL,
	latitude REAL NOT NULL DEFAULT '0.000000',
	longitude REAL NOT NULL DEFAULT '0.000000'
)
SERVER bsd_mysql_server
OPTIONS (
	dbname 'bernie16',
	table_name 'cons_addr'
);

--

CREATE FOREIGN TABLE IF NOT EXISTS mysql_bsd_cons_email(
  cons_email_id INTEGER NOT NULL,
  cons_id INTEGER NOT NULL,
  cons_email_type_id INTEGER NOT NULL DEFAULT '0',
  is_primary INTEGER NOT NULL DEFAULT '0',
  email TEXT NOT NULL,
  canonical_local_part TEXT DEFAULT NULL,
  domain TEXT DEFAULT NULL,
  double_validation TEXT DEFAULT NULL,
  create_dt TIMESTAMP DEFAULT NULL,
  create_app TEXT DEFAULT NULL,
  create_user TEXT DEFAULT NULL,
  modified_dt TIMESTAMP DEFAULT NULL,
  modified_app TEXT DEFAULT NULL,
  modified_user TEXT DEFAULT NULL,
  status INTEGER NOT NULL DEFAULT '1',
  note TEXT DEFAULT NULL
)
SERVER bsd_mysql_server
OPTIONS (
	dbname 'bernie16',
	table_name 'cons_email'
);

--

CREATE FOREIGN TABLE IF NOT EXISTS mysql_bsd_event_attendee(
  event_attendee_id INTEGER NOT NULL,
  attendee_cons_id INTEGER NOT NULL DEFAULT '0',
  event_id INTEGER NOT NULL DEFAULT '0',
  will_attend INTEGER NOT NULL DEFAULT '0',
  comment TEXT DEFAULT NULL,
  guests INTEGER DEFAULT NULL,
  pledge_amt INTEGER DEFAULT NULL,
  pledge_method INTEGER DEFAULT NULL,
  phone TEXT DEFAULT NULL,
  is_potential_volunteer INTEGER NOT NULL DEFAULT '0',
  is_reminder_sent INTEGER NOT NULL DEFAULT '0',
  addr1 TEXT DEFAULT NULL,
  addr2 TEXT DEFAULT NULL,
  addr3 TEXT DEFAULT NULL,
  city TEXT DEFAULT NULL,
  state_cd TEXT DEFAULT NULL,
  zip TEXT DEFAULT NULL,
  zip_4 TEXT DEFAULT NULL,
  country TEXT DEFAULT NULL,
  create_dt TIMESTAMP DEFAULT NULL,
  create_app TEXT DEFAULT NULL,
  create_user TEXT DEFAULT NULL,
  modified_dt TIMESTAMP DEFAULT NULL,
  modified_app TEXT DEFAULT NULL,
  modified_user TEXT DEFAULT NULL,
  status INTEGER NOT NULL DEFAULT '1',
  note TEXT DEFAULT NULL
)
SERVER bsd_mysql_server
OPTIONS (
	dbname 'bernie16',
	table_name 'event_attendee'
);

--

CREATE FOREIGN TABLE IF NOT EXISTS mysql_bsd_event_type(
  event_type_id TEXT NOT NULL,
  contribution_page_id TEXT DEFAULT NULL,
  name TEXT NOT NULL,
  description TEXT,
  van_campaign_title TEXT DEFAULT NULL,
  detail_label TEXT DEFAULT NULL,
  detail_text TEXT,
  can_users_create TEXT NOT NULL DEFAULT '0',
  fixed_title TEXT DEFAULT NULL,
  fixed_day date DEFAULT NULL,
  fixed_tz TEXT DEFAULT NULL,
  fixed_time time DEFAULT NULL,
  is_searchable TEXT NOT NULL DEFAULT '0',
  host_mailing_addr TEXT NOT NULL DEFAULT '0',
  contact_phone TEXT NOT NULL DEFAULT '0',
  can_set_capacity TEXT NOT NULL DEFAULT '0',
  expir_dt TIMESTAMP DEFAULT NULL,
  pledge_show TEXT NOT NULL DEFAULT '1',
  pledge_source TEXT DEFAULT NULL,
  pledge_subsource TEXT DEFAULT NULL,
  pledge_require TEXT NOT NULL DEFAULT '0',
  pledge_min float DEFAULT NULL,
  pledge_max float DEFAULT NULL,
  pledge_suggest float DEFAULT NULL,
  shifts_allow TEXT DEFAULT '0',
  multiple_dates_allow TEXT DEFAULT '0',
  rsvp_allow TEXT DEFAULT '1',
  rsvp_allow_reminder_email tinyTEXT NOT NULL DEFAULT '1',
  rsvp_require_signup TEXT DEFAULT '1',
  rsvp_disallow_account TEXT DEFAULT '0',
  rsvp_request_first_last_name TEXT DEFAULT '0',
  rsvp_require_first_last_name TEXT DEFAULT '0',
  rsvp_use_default_email_message TEXT DEFAULT '1',
  rsvp_collect_employer_occupation TEXT DEFAULT '0',
  rsvp_require_employer_occupation TEXT DEFAULT '0',
  rsvp_allow_host_override_email_message TEXT DEFAULT '0',
  rsvp_send_confirmation_email TEXT DEFAULT '1',
  rsvp_reason TEXT,
  rsvp_email_message TEXT,
  rsvp_email_message_html TEXT,
  rsvp_redirect_url TEXT NOT NULL DEFAULT '',
  attendee_volunteer_show TEXT NOT NULL DEFAULT '0',
  attendee_volunteer_message text NOT NULL,
  approval_require TEXT NOT NULL DEFAULT '0',
  map_marker_storage_key TEXT DEFAULT NULL,
  map_marker_width TEXT DEFAULT NULL,
  map_marker_height TEXT DEFAULT NULL,
  chapter_id TEXT NOT NULL,
  facebook_default_message text NOT NULL,
  twitter_default_message TEXT NOT NULL DEFAULT '',
  van_event_type_name TEXT DEFAULT NULL,
  van_program_type_name TEXT DEFAULT NULL,
  sync_to_van tinyTEXT NOT NULL DEFAULT '0',
  create_dt TIMESTAMP DEFAULT NULL,
  create_app TEXT DEFAULT NULL,
  create_user TEXT DEFAULT NULL,
  modified_dt TIMESTAMP DEFAULT NULL,
  modified_app TEXT DEFAULT NULL,
  modified_user TEXT DEFAULT NULL,
  status TEXT NOT NULL DEFAULT '1',
  note TEXT DEFAULT NULL,
  enable_addr_autofill TEXT NOT NULL DEFAULT '0',
  enable_host_addr_autofill TEXT NOT NULL DEFAULT '0',
)
SERVER bsd_mysql_server
OPTIONS (
	dbname 'bernie16',
	table_name 'event_type'
);

--

CREATE FOREIGN TABLE IF NOT EXISTS mysql_bsd_event(
  event_id TEXT NOT NULL,
  event_id_obfuscated TEXT DEFAULT NULL,
  event_type_id TEXT NOT NULL DEFAULT '0',
  creator_cons_id TEXT NOT NULL DEFAULT '0',
  contribution_page_id TEXT DEFAULT NULL,
  outreach_page_id TEXT DEFAULT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  creator_name TEXT DEFAULT NULL,
  start_day DATE NOT NULL,
  start_time TIME NOT NULL,
  start_dt TIMESTAMP NOT NULL ,
  start_tz TEXT DEFAULT NULL,
  duration TEXT DEFAULT NULL,
  parent_event_id TEXT NOT NULL DEFAULT '0',
  venue_name TEXT NOT NULL,
  venue_addr1 TEXT NOT NULL DEFAULT '',
  venue_addr2 TEXT DEFAULT NULL,
  venue_zip TEXT DEFAULT NULL,
  venue_city TEXT NOT NULL,
  venue_state_cd TEXT NOT NULL,
  venue_country TEXT NOT NULL DEFAULT 'US',
  venue_directions TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  host_addr_addressee TEXT DEFAULT NULL,
  host_addr_addr1 TEXT DEFAULT NULL,
  host_addr_addr2 TEXT DEFAULT NULL,
  host_addr_zip TEXT DEFAULT NULL,
  host_addr_city TEXT DEFAULT NULL,
  host_addr_state_cd TEXT DEFAULT NULL,
  host_addr_country TEXT NOT NULL DEFAULT 'US',
  host_receive_rsvp_emails TEXT NOT NULL DEFAULT '1',
  contact_phone TEXT DEFAULT NULL,
  public_phone TEXT NOT NULL DEFAULT '0',
  capacity TEXT NOT NULL DEFAULT '0',
  all_shifts_full TEXT NOT NULL DEFAULT '0',
  closed_msg TEXT,
  attendee_visibility TEXT NOT NULL DEFAULT '0',
  attendee_require_phone TEXT NOT NULL DEFAULT '0',
  attendee_volunteer_show TEXT NOT NULL DEFAULT '0',
  attendee_volunteer_message TEXT NOT NULL,
  is_official TEXT DEFAULT '0',
  pledge_override_type TEXT NOT NULL DEFAULT '0',
  pledge_show TEXT NOT NULL DEFAULT '1',
  pledge_source TEXT DEFAULT NULL,
  pledge_subsource TEXT DEFAULT NULL,
  pledge_require TEXT NOT NULL DEFAULT '0',
  pledge_min REAL DEFAULT NULL,
  pledge_max REAL DEFAULT NULL,
  pledge_suggest REAL DEFAULT NULL,
  rsvp_use_default_email_message TEXT DEFAULT '1',
  rsvp_email_message TEXT,
  rsvp_email_message_html TEXT,
  rsvp_use_reminder_email TEXT NOT NULL DEFAULT '0',
  rsvp_reminder_email_sent TEXT NOT NULL DEFAULT '0',
  rsvp_email_reminder_hours TEXT DEFAULT NULL,
  rsvp_allow TEXT DEFAULT '-1',
  rsvp_require_signup TEXT DEFAULT '-1',
  rsvp_disallow_account TEXT DEFAULT '-1',
  rsvp_reason TEXT,
  rsvp_redirect_url TEXT NOT NULL DEFAULT '',
  is_searchable TEXT NOT NULL DEFAULT '1',
  flag_approval TEXT NOT NULL DEFAULT '0',
  chapter_id TEXT NOT NULL,
  create_dt TIMESTAMP DEFAULT NULL,
  create_app TEXT DEFAULT NULL,
  create_user TEXT DEFAULT NULL,
  modified_dt TIMESTAMP DEFAULT NULL,
  modified_app TEXT DEFAULT NULL,
  modified_user TEXT DEFAULT NULL,
  status TEXT NOT NULL DEFAULT '1',
  note TEXT DEFAULT NULL
)
SERVER bsd_mysql_server
OPTIONS (
	dbname 'bernie16',
	table_name 'event'
);

--

CREATE FOREIGN TABLE IF NOT EXISTS mysql_bsd_cons_group(
  cons_group_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  public_name TEXT DEFAULT NULL,
  slug TEXT DEFAULT NULL,
  description TEXT,
  use_global_unsub INTEGER NOT NULL DEFAULT '1',
  is_banned INTEGER NOT NULL DEFAULT '0',
  activist_code_id INTEGER NOT NULL DEFAULT '0',
  create_dt TIMESTAMP DEFAULT NULL,
  create_app TEXT DEFAULT NULL,
  create_user TEXT DEFAULT NULL,
  modified_dt TIMESTAMP DEFAULT NULL,
  modified_app TEXT DEFAULT NULL,
  modified_user TEXT DEFAULT NULL,
  group_type TEXT NOT NULL DEFAULT 'manual',
  sqd TEXT,
  status INTEGER NOT NULL DEFAULT '1',
  members INTEGER DEFAULT NULL,
  unique_emails INTEGER DEFAULT NULL,
  unique_emails_subscribed INTEGER DEFAULT NULL,
  count_dt TIMESTAMP DEFAULT NULL,
  note TEXT DEFAULT NULL,
  chapter_id INTEGER NOT NULL,
  base_cons_group_id INTEGER DEFAULT NULL,
  membership_resource TEXT NOT NULL
)
SERVER bsd_mysql_server
OPTIONS (
	dbname 'bernie16',
	table_name 'cons_group'
);

--

CREATE FOREIGN TABLE IF NOT EXISTS mysql_bsd_cons(
  cons_id INTEGER NOT NULL,
  cons_source_id INTEGER NOT NULL DEFAULT '0',
  prefix TEXT DEFAULT NULL,
  firstname TEXT DEFAULT NULL,
  middlename TEXT DEFAULT NULL,
  lastname TEXT DEFAULT NULL,
  suffix TEXT DEFAULT NULL,
  salutation TEXT DEFAULT NULL,
  gender char(1) DEFAULT NULL,
  birth_dt TIMESTAMP DEFAULT NULL,
  title TEXT DEFAULT NULL,
  employer TEXT DEFAULT NULL,
  occupation TEXT DEFAULT NULL,
  income decimal(12,2) DEFAULT NULL,
  source TEXT DEFAULT NULL,
  subsource TEXT DEFAULT NULL,
  userid TEXT DEFAULT NULL,
  password TEXT DEFAULT NULL,
  is_validated INTEGER NOT NULL DEFAULT '0',
  is_banned INTEGER NOT NULL DEFAULT '0',
  change_password_next_login INTEGER NOT NULL DEFAULT '0',
  create_dt TIMESTAMP DEFAULT NULL,
  create_app TEXT DEFAULT NULL,
  create_user TEXT DEFAULT NULL,
  modified_dt TIMESTAMP DEFAULT NULL,
  modified_app TEXT DEFAULT NULL,
  modified_user TEXT DEFAULT NULL,
  status INTEGER NOT NULL DEFAULT '1',
  note TEXT DEFAULT NULL,
  is_deleted INTEGER DEFAULT '0'
)
SERVER bsd_mysql_server
OPTIONS (
	dbname 'bernie16',
	table_name 'cons'
);

--

CREATE FOREIGN TABLE IF NOT EXISTS mysql_bsd_cons_phone(
  cons_phone_id INTEGER NOT NULL,
  cons_id INTEGER NOT NULL,
  cons_phone_type_id INTEGER DEFAULT NULL,
  is_primary INTEGER NOT NULL DEFAULT '0',
  phone TEXT DEFAULT NULL,
  isunsub INTEGER DEFAULT NULL,
  create_dt TIMESTAMP DEFAULT NULL,
  create_app TEXT DEFAULT NULL,
  create_user TEXT DEFAULT NULL,
  modified_dt TIMESTAMP DEFAULT NULL,
  modified_app TEXT DEFAULT NULL,
  modified_user TEXT DEFAULT NULL,
  status INTEGER NOT NULL DEFAULT '1',
  note TEXT DEFAULT NULL
)
SERVER bsd_mysql_server
OPTIONS (
	dbname 'bernie16',
	table_name 'cons_phone'
);

--

CREATE FOREIGN TABLE IF NOT EXISTS mysql_bsd_signup_form_field(
  signup_form_field_id INTEGER NOT NULL,
  signup_form_id INTEGER NOT NULL,
  cons_field_id INTEGER NOT NULL DEFAULT '0',
  stg_signup_column_name TEXT DEFAULT NULL,
  format INTEGER NOT NULL,
  label TEXT,
  display_order INTEGER NOT NULL,
  is_shown INTEGER NOT NULL,
  is_required INTEGER NOT NULL,
  break_after INTEGER DEFAULT '1',
  description TEXT DEFAULT NULL,
  binarycheckbox_email TEXT,
  extra_def TEXT,
  create_dt TIMESTAMP DEFAULT NULL,
  create_app TEXT DEFAULT NULL,
  create_user TEXT DEFAULT NULL,
  modified_dt TIMESTAMP DEFAULT NULL,
  modified_app TEXT DEFAULT NULL,
  modified_user TEXT DEFAULT NULL,
  status INTEGER NOT NULL DEFAULT '1',
  note TEXT DEFAULT NULL,
  use_with_auto_resp INTEGER DEFAULT '0',
  is_custom_field INTEGER DEFAULT '0',
  is_voting_field INTEGER DEFAULT '0'
)
SERVER bsd_mysql_server
OPTIONS (
	dbname 'bernie16',
	table_name 'signup_form_field'
);

--

CREATE FOREIGN TABLE IF NOT EXISTS mysql_bsd_signup_form(
  signup_form_id INTEGER NOT NULL,
  cons_group_id INTEGER NOT NULL DEFAULT '0',
  signup_form_name TEXT NOT NULL,
  signup_form_slug TEXT DEFAULT NULL,
  form_public_title TEXT DEFAULT NULL,
  page_wrapper_id INTEGER NOT NULL DEFAULT '0',
  form_html_top TEXT NOT NULL,
  form_html_bottom TEXT NOT NULL,
  thank_you_html TEXT,
  thank_you_redirect TEXT DEFAULT NULL,
  thank_you_content_page_id INTEGER DEFAULT NULL,
  thank_you_contribution_page_id INTEGER DEFAULT NULL,
  thank_you_invite_page_id INTEGER DEFAULT NULL,
  thank_you_type INTEGER DEFAULT NULL,
  enforce_us_rules INTEGER NOT NULL DEFAULT '0',
  default_country TEXT DEFAULT 'US',
  submit_button_label TEXT NOT NULL DEFAULT '',
  show_in_search INTEGER NOT NULL DEFAULT '1',
  van_enabled INTEGER NOT NULL DEFAULT '0',
  email_copy TEXT DEFAULT NULL,
  email_in_subject INTEGER NOT NULL DEFAULT '0',
  copy_from_name TEXT DEFAULT NULL,
  copy_from_email TEXT DEFAULT NULL,
  copy_include_general INTEGER DEFAULT '1',
  auto_resp INTEGER NOT NULL DEFAULT '0',
  auto_resp_from_name TEXT DEFAULT NULL,
  auto_resp_subject TEXT DEFAULT NULL,
  auto_resp_from_email TEXT DEFAULT NULL,
  auto_resp_TEXT TEXT,
  auto_resp_use_html INTEGER NOT NULL DEFAULT '0',
  auto_resp_html TEXT,
  tracking_code_start TEXT,
  tracking_code_end TEXT,
  tracking_enabled INTEGER NOT NULL DEFAULT '0',
  default_source TEXT DEFAULT NULL,
  default_subsource TEXT DEFAULT NULL,
  opt_in INTEGER NOT NULL DEFAULT '0',
  opt_in_label TEXT,
  opt_in_description TEXT,
  opt_in_default INTEGER NOT NULL DEFAULT '0',
  subscribe_users INTEGER NOT NULL DEFAULT '1',
  email_opt_in_label TEXT,
  email_opt_in_default INTEGER NOT NULL DEFAULT '1',
  signup_cap INTEGER DEFAULT NULL,
  signup_cap_email TEXT DEFAULT NULL,
  signup_cap_get_action INTEGER NOT NULL DEFAULT '1',
  signup_cap_get_html TEXT,
  signup_cap_get_redirect TEXT DEFAULT NULL,
  signup_cap_post_action INTEGER NOT NULL DEFAULT '0',
  signup_cap_post_html TEXT,
  signup_cap_post_redirect TEXT DEFAULT NULL,
  use_captcha INTEGER NOT NULL DEFAULT '0',
  signup_download_storage_key TEXT DEFAULT NULL,
  activated_dt TIMESTAMP DEFAULT NULL,
  create_dt TIMESTAMP DEFAULT NULL,
  create_app TEXT DEFAULT NULL,
  create_user TEXT DEFAULT NULL,
  create_user_agent TEXT DEFAULT NULL,
  create_ip_addr TEXT DEFAULT NULL,
  create_admin_user_id INTEGER DEFAULT NULL,
  modified_dt TIMESTAMP DEFAULT NULL,
  modified_app TEXT DEFAULT NULL,
  modified_user TEXT DEFAULT NULL,
  modified_user_agent TEXT DEFAULT NULL,
  modified_ip_addr TEXT DEFAULT NULL,
  modified_admin_user_id INTEGER DEFAULT NULL,
  status INTEGER NOT NULL DEFAULT '1',
  note TEXT DEFAULT NULL,
  is_active INTEGER DEFAULT '1',
  base_signup_form_id INTEGER DEFAULT NULL,
  chapter_id INTEGER NOT NULL,
  snapshot_id INTEGER DEFAULT NULL,
  limit_within_secs INTEGER NOT NULL DEFAULT '-1',
  limit_on_email INTEGER NOT NULL DEFAULT '0',
  limit_on_ip INTEGER NOT NULL DEFAULT '0',
  limit_on_useragent INTEGER NOT NULL DEFAULT '0',
  limit_on_ballot INTEGER NOT NULL DEFAULT '0',
  inactive_redirect_url TEXT,
  enable_addr_autofill INTEGER NOT NULL DEFAULT '0'
)
SERVER bsd_mysql_server
OPTIONS (
  dbname 'bernie16',
  table_name 'signup_form'
);

--

-- CREATE FOREIGN TABLE IF NOT EXISTS mysql_bsd_cons_group_xxx(
--   cons_id INTEGER,
--   is_unsub INTEGER
-- )
-- SERVER bsd_mysql_server
-- OPTIONS (
--   dbname 'bernie16',
--   table_name 'cons_group_xxx'
-- );
