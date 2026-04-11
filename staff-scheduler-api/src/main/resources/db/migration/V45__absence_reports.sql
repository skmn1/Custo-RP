-- Task 87: Request Workflows — absence_reports table
-- Schema for recording unplanned absences (sick, late arrival, emergency, etc.)
-- Distinct from leave_requests which covers planned leave.

CREATE TABLE absence_reports (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id      UUID    NOT NULL,
  absence_date     DATE    NOT NULL,
  absence_type     VARCHAR(30) NOT NULL
    CHECK (absence_type IN ('sick','late_arrival','emergency','personal','other')),

  -- For late_arrival: optional timing
  expected_start   TIME,
  actual_start     TIME,

  -- Free text reason
  reason           TEXT,

  -- Medical certificate tracking
  cert_required    BOOLEAN NOT NULL DEFAULT false,
  cert_uploaded    BOOLEAN NOT NULL DEFAULT false,
  cert_file_key    VARCHAR(500),

  -- Workflow status
  status           VARCHAR(20) NOT NULL DEFAULT 'reported'
    CHECK (status IN ('reported','acknowledged','disputed','cancelled')),

  acknowledged_by  UUID,
  acknowledged_at  TIMESTAMP WITH TIME ZONE,
  disputed_by      UUID,
  disputed_at      TIMESTAMP WITH TIME ZONE,
  dispute_reason   TEXT,

  -- Audit
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Efficient lookup by employee + date (primary access pattern)
CREATE INDEX absence_reports_employee_date_idx
  ON absence_reports (employee_id, absence_date DESC);

-- Partial index for open workflow items (HR inbox queries)
CREATE INDEX absence_reports_status_idx
  ON absence_reports (status)
  WHERE status IN ('reported', 'disputed');

-- Unique constraint: one report per employee per calendar day
CREATE UNIQUE INDEX absence_reports_employee_date_uniq
  ON absence_reports (employee_id, absence_date);
