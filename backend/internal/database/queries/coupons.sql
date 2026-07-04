-- name: CreateCoupon :one
INSERT INTO coupons (
    code, student_id, discount_percentage, expires_at
) VALUES (
    $1, $2, $3, $4
)
RETURNING *;

-- name: GetValidCoupon :one
SELECT * FROM coupons
WHERE code = $1
  AND student_id = $2
  AND is_used = false
  AND (expires_at IS NULL OR expires_at > NOW())
LIMIT 1;

-- name: MarkCouponUsed :exec
UPDATE coupons
SET is_used = true
WHERE id = $1;

-- name: MarkCouponUnused :exec
UPDATE coupons
SET is_used = false
WHERE id = $1;
