ALTER TABLE availability_slots ADD COLUMN plan_id UUID REFERENCES mentorship_plans(id) ON DELETE CASCADE;
-- Cannot cleanly revert without a default plan_id, so this is a simplified down migration
ALTER TABLE availability_slots DROP COLUMN mentor_id;
