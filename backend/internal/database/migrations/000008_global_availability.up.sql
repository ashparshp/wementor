ALTER TABLE availability_slots ADD COLUMN mentor_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Backfill mentor_id from plan_id (if there are existing rows)
UPDATE availability_slots a
SET mentor_id = p.mentor_id
FROM mentorship_plans p
WHERE a.plan_id = p.id;

-- Make mentor_id NOT NULL and drop plan_id
ALTER TABLE availability_slots ALTER COLUMN mentor_id SET NOT NULL;
ALTER TABLE availability_slots DROP COLUMN plan_id;

DROP INDEX IF EXISTS idx_availability_slots_plan_id;
CREATE INDEX idx_availability_slots_mentor_id ON availability_slots(mentor_id);
