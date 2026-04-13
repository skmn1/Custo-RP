-- ─────────────────────────────────────────────────────────────────────────────
-- V46: Rename pos_terminal_id → pos_location_id in pos_assignments
--      (Task 93 — PoS Location Hub Redesign)
-- ─────────────────────────────────────────────────────────────────────────────

-- Rename column in pos_assignments (only if pos_terminal_id exists)
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pos_assignments' AND column_name = 'pos_terminal_id'
    ) THEN
        ALTER TABLE pos_assignments
            RENAME COLUMN pos_terminal_id TO pos_location_id;
    END IF;
END $$;

-- Update any NULL values to 1 (default location ID)
UPDATE pos_assignments
SET pos_location_id = 1
WHERE pos_location_id IS NULL;

-- Ensure NOT NULL constraint on the column
ALTER TABLE pos_assignments
    ALTER COLUMN pos_location_id SET NOT NULL;

-- Drop old unique constraint if it exists
ALTER TABLE pos_assignments
    DROP CONSTRAINT IF EXISTS uq_pos_assignments_user_terminal;

-- Create new unique constraint
ALTER TABLE pos_assignments
    ADD CONSTRAINT uq_pos_assignments_user_location
        UNIQUE (user_id, pos_location_id);

-- Rename index if it exists
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_pos_assignments_terminal_id'
    ) THEN
        ALTER INDEX idx_pos_assignments_terminal_id
            RENAME TO idx_pos_assignments_pos_location_id;
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- NOTE: The pos_terminals / point_of_sale table itself is NOT renamed in this
-- migration. A dedicated schema-migration task with full data-integrity checks
-- will handle that rename separately.
-- ─────────────────────────────────────────────────────────────────────────────
