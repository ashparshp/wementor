CREATE TABLE mentorship_plans (
    id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id                UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title                    VARCHAR(255) NOT NULL,
    description              TEXT,
    category                 VARCHAR(50)  NOT NULL
                             CHECK (category IN ('jee', 'neet', 'gsoc', 'placements', 'upsc', 'gate', 'cat', 'other')),
    price_paise              INT          NOT NULL CHECK (price_paise > 0),
    duration_minutes         INT          NOT NULL DEFAULT 60,
    min_booking_notice_hours INT          NOT NULL DEFAULT 24,
    status                   VARCHAR(20)  NOT NULL DEFAULT 'pending_review'
                             CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected', 'archived')),
    rejection_reason         TEXT,
    reviewed_by              UUID REFERENCES users(id),
    created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mentorship_plans_mentor_id ON mentorship_plans(mentor_id);
CREATE INDEX idx_mentorship_plans_status    ON mentorship_plans(status);
CREATE INDEX idx_mentorship_plans_category  ON mentorship_plans(category);

CREATE TABLE availability_slots (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id       UUID        NOT NULL REFERENCES mentorship_plans(id) ON DELETE CASCADE,
    slot_type     VARCHAR(20) NOT NULL CHECK (slot_type IN ('recurring', 'fixed')),
    day_of_week   INT         CHECK (day_of_week >= 0 AND day_of_week <= 6),
    specific_date DATE,
    start_time    TIME        NOT NULL,
    end_time      TIME        NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_slot CHECK (
        (slot_type = 'recurring' AND day_of_week IS NOT NULL AND specific_date IS NULL) OR
        (slot_type = 'fixed' AND specific_date IS NOT NULL AND day_of_week IS NULL)
    )
);

CREATE INDEX idx_availability_slots_plan_id ON availability_slots(plan_id);
