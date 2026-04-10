-- Task 42: Candidate Onboarding Pipeline & Account Provisioning
-- Run after the existing schema is applied.

-- A.1 Candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id                 UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name         VARCHAR(100) NOT NULL,
  last_name          VARCHAR(100) NOT NULL,
  email              VARCHAR(255) NOT NULL UNIQUE,
  phone              VARCHAR(30),
  position_title     VARCHAR(150) NOT NULL,
  department         VARCHAR(100),
  contract_type      VARCHAR(30)  NOT NULL
    CHECK (contract_type IN ('cdi','cdd','interim','apprenticeship','internship')),
  planned_start_date DATE,
  gross_salary       NUMERIC(12,2),
  probation_end_date DATE,
  status             VARCHAR(30)  NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','invited','documents_pending','under_review','approved','activated','rejected','archived')),
  notes              TEXT,
  created_by         UUID NOT NULL REFERENCES users(id),
  reviewed_by        UUID REFERENCES users(id),
  activated_at       TIMESTAMP WITH TIME ZONE,
  created_at         TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at         TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_created_by ON candidates(created_by);

-- A.2 Onboarding step definitions (seeded)
CREATE TABLE IF NOT EXISTS onboarding_step_definitions (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  description TEXT,
  is_required BOOLEAN NOT NULL DEFAULT true,
  category    VARCHAR(30)  NOT NULL
    CHECK (category IN ('identity','contract','hr','it','safety')),
  sort_order  INTEGER NOT NULL DEFAULT 0
);

INSERT INTO onboarding_step_definitions (name, description, is_required, category, sort_order) VALUES
  ('Identity Verification',    'Verify government-issued ID (passport or national ID)', true,  'identity', 10),
  ('Work Permit Check',        'Confirm right-to-work if applicable (non-EU candidates)', false, 'identity', 20),
  ('Contract Signature',       'Collect countersigned employment contract',               true,  'contract', 30),
  ('Bank Details (RIB)',       'Collect IBAN/RIB for payroll direct deposit',             true,  'hr',       40),
  ('Social Security Number',   'Record social security number for payroll declarations', true,  'hr',       50),
  ('IT Equipment Request',     'Submit equipment request (laptop, badge, peripherals)',   false, 'it',       60),
  ('System Access Setup',      'Create tool accounts (email, Slack, app roles)',          true,  'it',       70),
  ('Health & Safety Briefing', 'Schedule and complete workplace safety induction',        true,  'safety',   80),
  ('Role & Responsibilities',  'Send job description and team introduction email',        true,  'hr',       90),
  ('Welcome Email Sent',       'Send welcome email with first-day logistics',             true,  'hr',      100)
ON CONFLICT DO NOTHING;

-- A.3 Per-candidate step tracking
CREATE TABLE IF NOT EXISTS candidate_onboarding_steps (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID    NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  step_def_id  INTEGER NOT NULL REFERENCES onboarding_step_definitions(id),
  status       VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','completed','skipped','na')),
  completed_by UUID REFERENCES users(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes        TEXT,
  UNIQUE (candidate_id, step_def_id)
);

CREATE INDEX IF NOT EXISTS idx_cos_candidate ON candidate_onboarding_steps(candidate_id);

-- A.4 Candidate documents
CREATE TABLE IF NOT EXISTS candidate_documents (
  id                UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id      UUID    NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  document_type     VARCHAR(60) NOT NULL
    CHECK (document_type IN (
      'national_id','passport','work_permit','contract_signed',
      'rib','social_security','other'
    )),
  label             VARCHAR(200),
  storage_key       VARCHAR(500) NOT NULL,
  original_filename VARCHAR(300) NOT NULL,
  mime_type         VARCHAR(100) NOT NULL,
  file_size_bytes   INTEGER      NOT NULL,
  uploaded_by       UUID NOT NULL REFERENCES users(id),
  uploaded_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verified_by       UUID REFERENCES users(id),
  verified_at       TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_cdoc_candidate ON candidate_documents(candidate_id);
