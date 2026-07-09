-- name: CreateBooking :one
INSERT INTO bookings (
    student_id, mentor_id, plan_id, session_date, start_time, end_time, google_meet_link, status, coupon_id
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, 'confirmed', $8
)
RETURNING *;

-- name: GetBookingByID :one
SELECT * FROM bookings WHERE id = $1;

-- name: ListStudentBookings :many
SELECT
    b.*,
    mp.title AS plan_title,
    u.name AS mentor_name,
    p.status AS payment_status
FROM bookings b
JOIN mentorship_plans mp ON mp.id = b.plan_id
JOIN users u ON u.id = b.mentor_id
LEFT JOIN payments p ON p.booking_id = b.id
WHERE b.student_id = $1
ORDER BY b.session_date DESC, b.start_time DESC
LIMIT $2 OFFSET $3;

-- name: CountStudentBookings :one
SELECT COUNT(*) FROM bookings WHERE student_id = $1;

-- name: ListMentorBookings :many
SELECT
    b.*,
    mp.title AS plan_title,
    u.name AS student_name,
    p.status AS payment_status
FROM bookings b
JOIN mentorship_plans mp ON mp.id = b.plan_id
JOIN users u ON u.id = b.student_id
LEFT JOIN payments p ON p.booking_id = b.id
WHERE b.mentor_id = $1
ORDER BY b.session_date DESC, b.start_time DESC
LIMIT $2 OFFSET $3;

-- name: CountMentorBookings :one
SELECT COUNT(*) FROM bookings WHERE mentor_id = $1;

-- name: ListAllBookings :many
SELECT 
    b.*,
    mp.title AS plan_title,
    su.name AS student_name,
    mu.name AS mentor_name
FROM bookings b
JOIN mentorship_plans mp ON mp.id = b.plan_id
JOIN users su ON su.id = b.student_id
JOIN users mu ON mu.id = b.mentor_id
ORDER BY b.created_at DESC 
LIMIT $1 OFFSET $2;

-- name: CountAllBookings :one
SELECT COUNT(*) FROM bookings;

-- name: UpdateBookingStatus :exec
UPDATE bookings SET status = $2, updated_at = NOW() WHERE id = $1;

-- name: CheckSlotConflict :one
SELECT COUNT(*) FROM bookings
WHERE mentor_id = $1 AND session_date = $2 AND start_time = $3
AND status NOT IN ('cancelled_by_student', 'cancelled_by_mentor');

-- name: CountBookingsByStatus :one
SELECT COUNT(*) FROM bookings WHERE status = $1;

-- name: GetBookingsByMentorAndDate :many
SELECT * FROM bookings 
WHERE mentor_id = $1 AND session_date = $2 
AND status NOT IN ('cancelled_by_student', 'cancelled_by_mentor');
