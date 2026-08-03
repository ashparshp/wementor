-- WeMentor — fresh development schema (v1)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- Users
-- ─────────────────────────────────────────────
CREATE TABLE users (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email                VARCHAR(255) NOT NULL UNIQUE,
    password_hash        VARCHAR(255) NOT NULL,
    name                 VARCHAR(255) NOT NULL,
    role                 VARCHAR(20)  NOT NULL DEFAULT 'student'
                         CHECK (role IN ('student', 'mentor', 'admin')),
    email_verified       BOOLEAN      NOT NULL DEFAULT FALSE,
    must_change_password BOOLEAN      NOT NULL DEFAULT FALSE,
    avatar_url           TEXT,
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

-- ─────────────────────────────────────────────
-- OTP codes
-- ─────────────────────────────────────────────
CREATE TABLE otp_codes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email      VARCHAR(255) NOT NULL,
    code_hash  VARCHAR(255) NOT NULL,
    purpose    VARCHAR(30)  NOT NULL
               CHECK (purpose IN ('email_verification', 'password_reset')),
    attempts   INT          NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ  NOT NULL,
    used       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_otp_codes_email_purpose ON otp_codes(email, purpose);

-- ─────────────────────────────────────────────
-- Refresh tokens
-- ─────────────────────────────────────────────
CREATE TABLE refresh_tokens (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ  NOT NULL,
    revoked    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id    ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);

-- ─────────────────────────────────────────────
-- Mentor applications (admin reviews → auto account)
-- ─────────────────────────────────────────────
CREATE TABLE mentor_applications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    phone       VARCHAR(20)  NOT NULL,
    about       TEXT         NOT NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID         REFERENCES users(id),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mentor_applications_status ON mentor_applications(status);
CREATE INDEX idx_mentor_applications_email  ON mentor_applications(email);

-- ─────────────────────────────────────────────
-- Mentor profiles
-- ─────────────────────────────────────────────
CREATE TABLE mentor_profiles (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                  UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio                      TEXT,
    achievements             TEXT[] DEFAULT '{}',
    documents                TEXT[] DEFAULT '{}',
    google_meet_link         VARCHAR(500),
    phone                    VARCHAR(20),
    avg_rating               DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    total_reviews            INT              NOT NULL DEFAULT 0,
    total_sessions           INT              NOT NULL DEFAULT 0,
    min_booking_notice_hours INT              NOT NULL DEFAULT 24,
    max_booking_advance_days INT              NOT NULL DEFAULT 60,
    created_at               TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mentor_profiles_user_id ON mentor_profiles(user_id);

-- ─────────────────────────────────────────────
-- Mentorship plans (sessions)
-- ─────────────────────────────────────────────
CREATE TABLE mentorship_plans (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title             VARCHAR(255) NOT NULL,
    description       TEXT,
    category          VARCHAR(50)  NOT NULL
                      CHECK (category IN ('jee', 'neet', 'gsoc', 'lfx', 'placements', 'upsc', 'gate', 'cat', 'other')),
    price_paise       INT          NOT NULL CHECK (price_paise > 0),
    duration_minutes  INT          NOT NULL DEFAULT 60,
    status            VARCHAR(20)  NOT NULL DEFAULT 'pending_review'
                      CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected', 'archived')),
    rejection_reason  TEXT,
    reviewed_by       UUID REFERENCES users(id),
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mentorship_plans_mentor_id ON mentorship_plans(mentor_id);
CREATE INDEX idx_mentorship_plans_status    ON mentorship_plans(status);
CREATE INDEX idx_mentorship_plans_category  ON mentorship_plans(category);

-- ─────────────────────────────────────────────
-- Global mentor availability (not per-plan)
-- ─────────────────────────────────────────────
CREATE TABLE availability_slots (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

CREATE INDEX idx_availability_slots_mentor_id ON availability_slots(mentor_id);

-- ─────────────────────────────────────────────
-- Coupons
-- ─────────────────────────────────────────────
CREATE TABLE coupons (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                 VARCHAR(50) UNIQUE NOT NULL,
    student_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    discount_percentage  INT  NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
    is_used              BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at           TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coupons_student_id ON coupons(student_id);
CREATE INDEX idx_coupons_code        ON coupons(code);

-- ─────────────────────────────────────────────
-- Bookings
-- ─────────────────────────────────────────────
CREATE TABLE bookings (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id       UUID        NOT NULL REFERENCES users(id),
    mentor_id        UUID        NOT NULL REFERENCES users(id),
    plan_id          UUID        NOT NULL REFERENCES mentorship_plans(id),
    session_date     DATE        NOT NULL,
    start_time       TIME        NOT NULL,
    end_time         TIME        NOT NULL,
    google_meet_link VARCHAR(500),
    status           VARCHAR(30) NOT NULL DEFAULT 'confirmed'
                     CHECK (status IN ('confirmed', 'completed', 'cancelled_by_student', 'cancelled_by_mentor', 'no_show')),
    coupon_id        UUID        REFERENCES coupons(id) ON DELETE SET NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_student_id   ON bookings(student_id);
CREATE INDEX idx_bookings_mentor_id    ON bookings(mentor_id);
CREATE INDEX idx_bookings_plan_id      ON bookings(plan_id);
CREATE INDEX idx_bookings_session_date ON bookings(session_date);
CREATE INDEX idx_bookings_status       ON bookings(status);

CREATE UNIQUE INDEX idx_bookings_unique_slot
    ON bookings(mentor_id, session_date, start_time)
    WHERE status NOT IN ('cancelled_by_student', 'cancelled_by_mentor');

-- ─────────────────────────────────────────────
-- Payments (15% platform / 85% mentor split)
-- ─────────────────────────────────────────────
CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id          UUID        NOT NULL UNIQUE REFERENCES bookings(id),
    student_id          UUID        NOT NULL REFERENCES users(id),
    amount_paise        INT         NOT NULL,
    platform_fee_paise  INT         NOT NULL DEFAULT 0,
    mentor_payout_paise INT         NOT NULL DEFAULT 0,
    currency            VARCHAR(3)  NOT NULL DEFAULT 'INR',
    order_number        VARCHAR(20) UNIQUE,
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
CREATE INDEX idx_payments_order_number      ON payments(order_number);

CREATE SEQUENCE IF NOT EXISTS payment_order_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    seq_val INT;
    date_part TEXT;
BEGIN
    seq_val := nextval('payment_order_seq');
    date_part := to_char(NOW(), 'YYMMDD');
    NEW.order_number := 'WM-' || date_part || '-' || lpad(seq_val::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
    BEFORE INSERT ON payments
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL)
    EXECUTE FUNCTION generate_order_number();

-- ─────────────────────────────────────────────
-- Reviews
-- ─────────────────────────────────────────────
CREATE TABLE reviews (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id),
    student_id UUID NOT NULL REFERENCES users(id),
    mentor_id  UUID NOT NULL REFERENCES users(id),
    rating     INT  NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment    TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_mentor_id  ON reviews(mentor_id);
CREATE INDEX idx_reviews_student_id ON reviews(student_id);
