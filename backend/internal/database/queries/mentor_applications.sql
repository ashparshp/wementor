-- name: CreateMentorApplication :one
INSERT INTO mentor_applications (email, phone, about)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetMentorApplicationByID :one
SELECT * FROM mentor_applications WHERE id = $1;

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
SET status = 'approved', invite_code = $2, invite_code_expires_at = $3,
    reviewed_by = $4, updated_at = NOW()
WHERE id = $1;

-- name: RejectMentorApplication :exec
UPDATE mentor_applications
SET status = 'rejected', reviewed_by = $2, updated_at = NOW()
WHERE id = $1;

-- name: GetMentorApplicationByInviteCode :one
SELECT * FROM mentor_applications
WHERE invite_code = $1 AND status = 'approved' AND invite_code_expires_at > NOW();

-- name: InvalidateInviteCode :exec
UPDATE mentor_applications
SET invite_code = NULL, invite_code_expires_at = NULL
WHERE id = $1;
