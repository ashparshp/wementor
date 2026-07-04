-- name: CreateReview :one
INSERT INTO reviews (booking_id, student_id, mentor_id, rating, comment)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: GetReviewByBookingID :one
SELECT * FROM reviews WHERE booking_id = $1;

-- name: ListMentorReviews :many
SELECT
    r.*,
    u.name AS student_name
FROM reviews r
JOIN users u ON u.id = r.student_id
WHERE r.mentor_id = $1
ORDER BY r.created_at DESC
LIMIT $2 OFFSET $3;

-- name: CountMentorReviews :one
SELECT COUNT(*) FROM reviews WHERE mentor_id = $1;

-- name: GetMentorAverageRating :one
SELECT
    COALESCE(AVG(rating), 0)::float8 AS avg_rating,
    COUNT(*)::bigint AS total_reviews
FROM reviews
WHERE mentor_id = $1;
