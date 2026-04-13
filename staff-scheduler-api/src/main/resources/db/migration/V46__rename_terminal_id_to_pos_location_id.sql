-- ─────────────────────────────────────────────────────────────────────────────
-- V46: Rename pos_terminal_id → pos_location_id in pos_assignments
--      (Task 93 — PoS Location Hub Redesign)
-- ─────────────────────────────────────────────────────────────────────────────

-- Rename column in pos_assignments
ALTER TABLE pos_assignments
    RENAME COLUMN pos_terminal_id TO pos_location_id;

-- Drop old unique constraint and recreate with the new column name
ALTER TABLE pos_assignments
    DROP CONSTRAINT IF EXISTS uq_pos_assignments_user_terminal;

ALTER TABLE pos_assignments
    ADD CONSTRAINT uq_pos_assignments_user_location
        UNIQUE (user_id, pos_location_id);

-- Rename index for clarity
ALTER INDEX IF EXISTS idx_pos_assignments_terminal_id
    RENAME TO idx_pos_assignments_pos_location_id;

-- ─────────────────────────────────────────────────────────────────────────────
-- NOTE: The pos_terminals / point_of_sale table itself is NOT renamed in this
-- migration. A dedicated schema-migration task with full data-integrity checks
-- will handle that rename separately.
-- ─────────────────────────────────────────────────────────────────────────────
