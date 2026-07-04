-- name: CreatePayment :one
INSERT INTO payments (booking_id, student_id, amount_paise, razorpay_order_id)
VALUES ($1, $2, $3, $4)
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
    u.name AS student_name, u.email AS student_email
FROM payments p
JOIN users u ON u.id = p.student_id
ORDER BY p.created_at DESC
LIMIT $1 OFFSET $2;

-- name: CountAllPayments :one
SELECT COUNT(*) FROM payments;

-- name: SumCapturedPayments :one
SELECT COALESCE(SUM(amount_paise), 0)::bigint AS total FROM payments WHERE status = 'captured';
