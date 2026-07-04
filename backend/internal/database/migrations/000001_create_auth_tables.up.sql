-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- Users table (all roles)
-- ─────────────────────────────────────────────
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name          VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'student'
                  CHECK (role IN ('student', 'mentor', 'admin')),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    avatar_url    TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

-- ─────────────────────────────────────────────
-- OTP codes (email verification & password reset)
-- ─────────────────────────────────────────────
CREATE TABLE otp_codes (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
-- Refresh tokens (hashed, revocable)
-- ─────────────────────────────────────────────
CREATE TABLE refresh_tokens (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ  NOT NULL,
    revoked    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id    ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
