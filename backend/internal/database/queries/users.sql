-- name: CreateUser :one
INSERT INTO users (email, password_hash, name, role)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1;

-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1;

-- name: UpdateEmailVerified :exec
UPDATE users SET email_verified = TRUE, updated_at = NOW() WHERE id = $1;

-- name: UpdatePassword :exec
UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2;

-- name: UpdateUserProfile :one
UPDATE users SET name = $2, avatar_url = $3, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: ListUsers :many
SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2;

-- name: CountUsers :one
SELECT COUNT(*) FROM users;

-- name: CountUsersByRole :one
SELECT COUNT(*) FROM users WHERE role = $1;
