CREATE TABLE bookings (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id       UUID        NOT NULL REFERENCES users(id),
    mentor_id        UUID        NOT NULL REFERENCES users(id),
    plan_id          UUID        NOT NULL REFERENCES mentorship_plans(id),
    session_date     DATE        NOT NULL,
    start_time       TIME        NOT NULL,
    end_time         TIME        NOT NULL,
    google_meet_link VARCHAR(500),
    status           VARCHAR(30) NOT NULL DEFAULT 'confirmed'
                     CHECK (status IN ('confirmed', 'completed', 'cancelled_by_student', 'cancelled_by_mentor', 'no_show')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_student_id   ON bookings(student_id);
CREATE INDEX idx_bookings_mentor_id    ON bookings(mentor_id);
CREATE INDEX idx_bookings_plan_id      ON bookings(plan_id);
CREATE INDEX idx_bookings_session_date ON bookings(session_date);
CREATE INDEX idx_bookings_status       ON bookings(status);

-- Prevent double-booking the same mentor slot
CREATE UNIQUE INDEX idx_bookings_unique_slot
    ON bookings(mentor_id, session_date, start_time)
    WHERE status NOT IN ('cancelled_by_student', 'cancelled_by_mentor');

CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id          UUID        NOT NULL UNIQUE REFERENCES bookings(id),
    student_id          UUID        NOT NULL REFERENCES users(id),
    amount_paise        INT         NOT NULL,
    currency            VARCHAR(3)  NOT NULL DEFAULT 'INR',
    razorpay_order_id   VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    razorpay_signature  VARCHAR(255),
    status              VARCHAR(20) NOT NULL DEFAULT 'created'
                        CHECK (status IN ('created', 'captured', 'failed', 'refunded')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_booking_id        ON payments(booking_id);
CREATE INDEX idx_payments_student_id        ON payments(student_id);
CREATE INDEX idx_payments_razorpay_order_id ON payments(razorpay_order_id);

CREATE TABLE reviews (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id),
    student_id UUID NOT NULL REFERENCES users(id),
    mentor_id  UUID NOT NULL REFERENCES users(id),
    rating     INT  NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment    TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_mentor_id  ON reviews(mentor_id);
CREATE INDEX idx_reviews_student_id ON reviews(student_id);
