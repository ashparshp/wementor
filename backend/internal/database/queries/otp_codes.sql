-- name: CreateOTP :one
INSERT INTO otp_codes (email, code_hash, purpose, expires_at)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetLatestOTP :one
SELECT * FROM otp_codes
WHERE email = $1 AND purpose = $2 AND used = FALSE AND expires_at > NOW()
ORDER BY created_at DESC
LIMIT 1;

-- name: IncrementOTPAttempts :exec
UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1;

-- name: MarkOTPUsed :exec
UPDATE otp_codes SET used = TRUE WHERE id = $1;

-- name: CountRecentOTPs :one
SELECT COUNT(*) FROM otp_codes
WHERE email = $1 AND purpose = $2 AND created_at > NOW() - INTERVAL '1 hour';

-- name: DeleteExpiredOTPs :exec
DELETE FROM otp_codes WHERE expires_at < NOW();
