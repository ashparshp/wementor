ALTER TABLE availability_slots ADD COLUMN IF NOT EXISTS mentor_id UUID REFERENCES users(id) ON DELETE CASCADE;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='availability_slots' AND column_name='plan_id') THEN
        UPDATE availability_slots a
        SET mentor_id = p.mentor_id
        FROM mentorship_plans p
        WHERE a.plan_id = p.id;

        ALTER TABLE availability_slots ALTER COLUMN mentor_id SET NOT NULL;
        ALTER TABLE availability_slots DROP COLUMN plan_id;

        DROP INDEX IF EXISTS idx_availability_slots_plan_id;
        CREATE INDEX idx_availability_slots_mentor_id ON availability_slots(mentor_id);
    END IF;
END $$;
