CREATE TABLE mentor_profiles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio             TEXT,
    achievements    TEXT[] DEFAULT '{}',
    documents       TEXT[] DEFAULT '{}',
    google_meet_link VARCHAR(500),
    phone           VARCHAR(20),
    avg_rating      DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    total_reviews   INT              NOT NULL DEFAULT 0,
    total_sessions  INT              NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mentor_profiles_user_id ON mentor_profiles(user_id);
