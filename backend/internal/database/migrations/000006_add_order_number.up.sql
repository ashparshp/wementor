-- Add a sequential, human-readable order number to payments.
-- Format: WM-YYMMDD-XXXX (auto-generated via trigger)

ALTER TABLE payments ADD COLUMN order_number VARCHAR(20) UNIQUE;

-- Sequence for the daily counter
CREATE SEQUENCE IF NOT EXISTS payment_order_seq START 1;

-- Function to generate order number: WM-YYMMDD-XXXX
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    seq_val INT;
    date_part TEXT;
BEGIN
    seq_val := nextval('payment_order_seq');
    date_part := to_char(NOW(), 'YYMMDD');
    NEW.order_number := 'WM-' || date_part || '-' || lpad(seq_val::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-set order_number on insert
CREATE TRIGGER set_order_number
    BEFORE INSERT ON payments
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL)
    EXECUTE FUNCTION generate_order_number();

CREATE INDEX idx_payments_order_number ON payments(order_number);
