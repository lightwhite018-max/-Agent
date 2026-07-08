-- 劳动者港湾智能助手 V0.6 数据库草案
-- 目标：对齐当前前端 seed 数据和 PRD P0-M 闭环，后续可迁移到 SQLite/PostgreSQL/MySQL。

CREATE TABLE harbor (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  business_area TEXT NOT NULL,
  address TEXT NOT NULL,
  longitude REAL NOT NULL,
  latitude REAL NOT NULL,
  walking_time_minutes INTEGER,
  distance_meters INTEGER,
  status TEXT NOT NULL CHECK (status IN ('open', 'closed', 'temp_closed')),
  status_reason TEXT,
  opening_hours TEXT NOT NULL,
  crowd_level TEXT NOT NULL DEFAULT 'unknown' CHECK (crowd_level IN ('quiet', 'moderate', 'crowded', 'unknown')),
  updated_at TEXT NOT NULL,
  last_verified_at TEXT NOT NULL,
  data_freshness_status TEXT NOT NULL DEFAULT 'fresh' CHECK (data_freshness_status IN ('fresh', 'stale'))
);

CREATE TABLE facility (
  id TEXT PRIMARY KEY,
  harbor_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (
    type IN (
      'drinking_water',
      'charging',
      'rest',
      'indoor',
      'toilet',
      'microwave',
      'first_aid',
      'hot_water',
      'umbrella'
    )
  ),
  name TEXT NOT NULL,
  available INTEGER NOT NULL DEFAULT 1 CHECK (available IN (0, 1)),
  status TEXT NOT NULL DEFAULT 'normal' CHECK (status IN ('normal', 'fault', 'maintenance', 'unknown')),
  FOREIGN KEY (harbor_id) REFERENCES harbor(id)
);

CREATE TABLE report (
  id TEXT PRIMARY KEY,
  harbor_id TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'resolved', 'rejected')),
  created_at TEXT NOT NULL,
  FOREIGN KEY (harbor_id) REFERENCES harbor(id)
);

CREATE TABLE work_order (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL,
  harbor_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'resolved', 'closed')),
  assignee TEXT,
  result_note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (report_id) REFERENCES report(id),
  FOREIGN KEY (harbor_id) REFERENCES harbor(id)
);

CREATE TABLE conversation_log (
  id TEXT PRIMARY KEY,
  user_input TEXT NOT NULL,
  intent TEXT,
  extracted_params TEXT,
  missing_params TEXT,
  fallback_used INTEGER NOT NULL DEFAULT 0 CHECK (fallback_used IN (0, 1)),
  result_count INTEGER NOT NULL DEFAULT 0,
  error_code TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE recommendation_log (
  id TEXT PRIMARY KEY,
  need_type TEXT NOT NULL,
  filters TEXT NOT NULL,
  candidate_count INTEGER NOT NULL DEFAULT 0,
  result_harbor_ids TEXT NOT NULL,
  score_detail TEXT,
  map_api_status TEXT NOT NULL DEFAULT 'not_called',
  weather_api_status TEXT NOT NULL DEFAULT 'not_called',
  fallback_used INTEGER NOT NULL DEFAULT 0 CHECK (fallback_used IN (0, 1)),
  no_result_reason TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_harbor_location ON harbor(district, business_area);
CREATE INDEX idx_harbor_status ON harbor(status);
CREATE INDEX idx_facility_harbor ON facility(harbor_id);
CREATE INDEX idx_facility_type_status ON facility(type, status, available);
CREATE INDEX idx_report_harbor_status ON report(harbor_id, status);
CREATE INDEX idx_work_order_status ON work_order(status);
