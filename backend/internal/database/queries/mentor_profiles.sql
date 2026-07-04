-- name: CreateMentorProfile :one
INSERT INTO mentor_profiles (user_id, phone, google_meet_link, bio)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetMentorProfileByUserID :one
SELECT * FROM mentor_profiles WHERE user_id = $1;

-- name: UpdateMentorProfile :one
UPDATE mentor_profiles
SET bio = $2, achievements = $3, documents = $4,
    google_meet_link = $5, phone = $6, updated_at = NOW()
WHERE user_id = $1
RETURNING *;

-- name: ListMentorProfiles :many
SELECT
    mp.id, mp.user_id, mp.bio, mp.achievements, mp.documents,
    mp.google_meet_link, mp.phone, mp.avg_rating, mp.total_reviews,
    mp.total_sessions, mp.created_at, mp.updated_at,
    u.name AS user_name, u.email AS user_email, u.avatar_url AS user_avatar_url
FROM mentor_profiles mp
JOIN users u ON u.id = mp.user_id
WHERE u.role = 'mentor'
ORDER BY mp.avg_rating DESC, mp.total_sessions DESC
LIMIT $1 OFFSET $2;

-- name: CountMentorProfiles :one
SELECT COUNT(*) FROM mentor_profiles;

-- name: GetMentorPublicProfile :one
SELECT
    mp.id, mp.user_id, mp.bio, mp.achievements, mp.documents,
    mp.google_meet_link, mp.phone, mp.avg_rating, mp.total_reviews,
    mp.total_sessions, mp.created_at, mp.updated_at,
    u.name AS user_name, u.email AS user_email, u.avatar_url AS user_avatar_url
FROM mentor_profiles mp
JOIN users u ON u.id = mp.user_id
WHERE mp.user_id = $1;

-- name: UpdateMentorRating :exec
UPDATE mentor_profiles
SET avg_rating = $2, total_reviews = $3, updated_at = NOW()
WHERE user_id = $1;

-- name: IncrementMentorSessions :exec
UPDATE mentor_profiles
SET total_sessions = total_sessions + 1, updated_at = NOW()
WHERE user_id = $1;
