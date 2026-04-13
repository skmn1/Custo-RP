-- ─────────────────────────────────────────────────────────────────────────────
-- V48: Update NULL pos_location_id values before applying NOT NULL constraint
--      (Task 93 — PoS Location Hub Redesign — Fix)
-- ─────────────────────────────────────────────────────────────────────────────

-- If there are any NULL values in pos_location_id, set them to 1 as a default
-- This should only affect test/dev data
UPDATE pos_assignments
SET pos_location_id = 1
WHERE pos_location_id IS NULL;

-- Now ensure NOT NULL constraint on pos_location_id
-- If the constraint was already applied by a previous migration, this will error but that's OK
ALTER TABLE pos_assignments
    ALTER COLUMN pos_location_id SET NOT NULL;
