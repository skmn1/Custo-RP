-- ─────────────────────────────────────────────────────────────────────────────
-- V47: Fix pos_location_id NOT NULL constraint
--      (Task 93 — PoS Location Hub Redesign — Fix)
-- ─────────────────────────────────────────────────────────────────────────────

-- Ensure NOT NULL constraint on pos_location_id
-- This was missing from V46 and causes Hibernate schema validation to fail
ALTER TABLE pos_assignments
    ALTER COLUMN pos_location_id SET NOT NULL;
