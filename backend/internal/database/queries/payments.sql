-- name: CreatePayment :one
INSERT INTO payments (
    booking_id, student_id, amount_paise, platform_fee_paise, mentor_payout_paise, razorpay_order_id
) VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetPaymentByBookingID :one
SELECT * FROM payments WHERE booking_id = $1;

-- name: GetPaymentByRazorpayOrderID :one
SELECT * FROM payments WHERE razorpay_order_id = $1;

-- name: UpdatePaymentCaptured :exec
UPDATE payments
SET razorpay_payment_id = $2, razorpay_signature = $3, status = 'captured', updated_at = NOW()
WHERE id = $1;

-- name: UpdatePaymentFailed :exec
UPDATE payments SET status = 'failed', updated_at = NOW() WHERE id = $1;

-- name: ListAllPayments :many
SELECT
    p.*,
    u.name AS student_name,
    u.email AS student_email,
    mu.name AS mentor_name,
    mp.title AS plan_title
FROM payments p
JOIN users u ON u.id = p.student_id
JOIN bookings b ON b.id = p.booking_id
JOIN users mu ON mu.id = b.mentor_id
JOIN mentorship_plans mp ON mp.id = b.plan_id
ORDER BY p.created_at DESC
LIMIT $1 OFFSET $2;

-- name: ListMentorPayments :many
SELECT
    p.*,
    mp.title AS plan_title,
    su.name AS student_name
FROM payments p
JOIN bookings b ON b.id = p.booking_id
JOIN mentorship_plans mp ON mp.id = b.plan_id
JOIN users su ON su.id = p.student_id
WHERE b.mentor_id = $1 AND p.status = 'captured'
ORDER BY p.created_at DESC
LIMIT $2 OFFSET $3;

-- name: CountMentorPayments :one
SELECT COUNT(*)
FROM payments p
JOIN bookings b ON b.id = p.booking_id
WHERE b.mentor_id = $1 AND p.status = 'captured';

-- name: CountAllPayments :one
SELECT COUNT(*) FROM payments;

-- name: SumCapturedPayments :one
SELECT COALESCE(SUM(amount_paise), 0)::bigint AS total FROM payments WHERE status = 'captured';

-- name: SumPlatformFees :one
SELECT COALESCE(SUM(platform_fee_paise), 0)::bigint AS total FROM payments WHERE status = 'captured';

-- name: SumMentorPayouts :one
SELECT COALESCE(SUM(mentor_payout_paise), 0)::bigint AS total FROM payments WHERE status = 'captured';

-- name: SumMentorEarnings :one
SELECT COALESCE(SUM(p.mentor_payout_paise), 0)::bigint AS total
FROM payments p
JOIN bookings b ON b.id = p.booking_id
WHERE b.mentor_id = $1 AND p.status = 'captured';
