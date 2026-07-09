ALTER TABLE mentor_profiles ADD COLUMN min_booking_notice_hours INTEGER NOT NULL DEFAULT 24;
ALTER TABLE mentor_profiles ADD COLUMN max_booking_advance_days INTEGER NOT NULL DEFAULT 60;

ALTER TABLE mentorship_plans DROP COLUMN min_booking_notice_hours;
