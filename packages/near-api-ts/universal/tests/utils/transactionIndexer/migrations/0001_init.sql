CREATE TABLE IF NOT EXISTS failed_transactions
(
    tx_hash      TEXT PRIMARY KEY,
    error_kind   TEXT  NOT NULL,
    raw_response JSONB NOT NULL
);
