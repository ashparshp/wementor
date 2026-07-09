ALTER TABLE mentorship_plans ADD COLUMN min_booking_notice_hours INTEGER NOT NULL DEFAULT 24;

ALTER TABLE mentor_profiles DROP COLUMN min_booking_notice_hours;
ALTER TABLE mentor_profiles DROP COLUMN max_booking_advance_days;
