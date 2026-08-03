-- name: CreateMentorApplication :one
INSERT INTO mentor_applications (name, email, phone, about)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetMentorApplicationByID :one
SELECT * FROM mentor_applications WHERE id = $1;

-- name: GetMentorApplicationByEmail :one
SELECT * FROM mentor_applications WHERE email = $1 AND status = 'pending';

-- name: ListMentorApplications :many
SELECT * FROM mentor_applications
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: ListMentorApplicationsByStatus :many
SELECT * FROM mentor_applications
WHERE status = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: CountMentorApplications :one
SELECT COUNT(*) FROM mentor_applications;

-- name: CountMentorApplicationsByStatus :one
SELECT COUNT(*) FROM mentor_applications WHERE status = $1;

-- name: ApproveMentorApplication :exec
UPDATE mentor_applications
SET status = 'approved', reviewed_by = $2, updated_at = NOW()
WHERE id = $1;

-- name: RejectMentorApplication :exec
UPDATE mentor_applications
SET status = 'rejected', reviewed_by = $2, updated_at = NOW()
WHERE id = $1;
