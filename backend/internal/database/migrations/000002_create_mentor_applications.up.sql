CREATE TABLE mentor_applications (
    id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email                  VARCHAR(255) NOT NULL,
    phone                  VARCHAR(20)  NOT NULL,
    about                  TEXT         NOT NULL,
    status                 VARCHAR(20)  NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'approved', 'rejected')),
    invite_code            VARCHAR(6),
    invite_code_expires_at TIMESTAMPTZ,
    reviewed_by            UUID REFERENCES users(id),
    created_at             TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mentor_applications_status ON mentor_applications(status);
CREATE INDEX idx_mentor_applications_email  ON mentor_applications(email);
