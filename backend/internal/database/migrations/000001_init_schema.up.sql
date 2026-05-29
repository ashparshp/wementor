CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	email TEXT NOT NULL UNIQUE,
	phone TEXT UNIQUE,
	password_hash TEXT NOT NULL,
	profile_image_url TEXT,
	full_name TEXT NOT NULL,
	role TEXT NOT NULL DEFAULT 'user', -- Possible values: 'admin', 'mentor', 'user'
	is_verified BOOLEAN NOT NULL DEFAULT FALSE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	last_login_at TIMESTAMPTZ,
	deleted_at TIMESTAMPTZ
);
