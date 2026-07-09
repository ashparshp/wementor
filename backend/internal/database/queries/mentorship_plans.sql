-- name: CreateMentorshipPlan :one
INSERT INTO mentorship_plans (mentor_id, title, description, category, price_paise, duration_minutes)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetMentorshipPlanByID :one
SELECT * FROM mentorship_plans WHERE id = $1;

-- name: ListApprovedPlans :many
SELECT * FROM mentorship_plans
WHERE status = 'approved'
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: ListApprovedPlansByCategory :many
SELECT * FROM mentorship_plans
WHERE status = 'approved' AND category = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: CountApprovedPlans :one
SELECT COUNT(*) FROM mentorship_plans WHERE status = 'approved';

-- name: CountApprovedPlansByCategory :one
SELECT COUNT(*) FROM mentorship_plans WHERE status = 'approved' AND category = $1;

-- name: ListMentorPlans :many
SELECT * FROM mentorship_plans
WHERE mentor_id = $1
ORDER BY created_at DESC;

-- name: UpdateMentorshipPlan :one
UPDATE mentorship_plans
SET title = $2, description = $3, category = $4, price_paise = $5,
    duration_minutes = $6,
    status = 'pending_review', rejection_reason = NULL, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: UpdatePlanStatus :exec
UPDATE mentorship_plans
SET status = $2, rejection_reason = $3, reviewed_by = $4, updated_at = NOW()
WHERE id = $1;

-- name: ArchivePlan :exec
UPDATE mentorship_plans SET status = 'archived', updated_at = NOW() WHERE id = $1;

-- name: ListPendingPlans :many
SELECT
    mp.*,
    u.name AS mentor_name, u.email AS mentor_email
FROM mentorship_plans mp
JOIN users u ON u.id = mp.mentor_id
WHERE mp.status = 'pending_review'
ORDER BY mp.created_at ASC
LIMIT $1 OFFSET $2;

-- name: CountPendingPlans :one
SELECT COUNT(*) FROM mentorship_plans WHERE status = 'pending_review';

-- ─────────────────────────────────────────────
-- Availability Slots
-- ─────────────────────────────────────────────

-- name: CreateAvailabilitySlot :one
INSERT INTO availability_slots (mentor_id, slot_type, day_of_week, specific_date, start_time, end_time)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: DeleteAvailabilitySlotsByMentorID :exec
DELETE FROM availability_slots WHERE mentor_id = $1;

-- name: GetAvailabilitySlotsByMentorID :many
SELECT * FROM availability_slots
WHERE mentor_id = $1
ORDER BY COALESCE(day_of_week, 7), specific_date, start_time;
