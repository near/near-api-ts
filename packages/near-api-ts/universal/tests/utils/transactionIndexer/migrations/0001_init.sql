CREATE TABLE IF NOT EXISTS failed_transactions
(
    receipt_id   TEXT PRIMARY KEY,
    tx_hash      TEXT  NOT NULL,
    error_kind   TEXT  NOT NULL,
    block_date   DATE  NOT NULL,
    raw_response JSONB NOT NULL
);
