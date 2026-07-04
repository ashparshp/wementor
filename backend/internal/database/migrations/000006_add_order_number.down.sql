DROP TRIGGER IF EXISTS set_order_number ON payments;
DROP FUNCTION IF EXISTS generate_order_number;
DROP SEQUENCE IF EXISTS payment_order_seq;
ALTER TABLE payments DROP COLUMN IF EXISTS order_number;
