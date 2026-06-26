-- Base schema for the transaction indexer.

CREATE TABLE IF NOT EXISTS transactions (
  hash         TEXT        PRIMARY KEY,
  signer_id    TEXT        NOT NULL,
  receiver_id  TEXT        NOT NULL,
  block_height BIGINT      NOT NULL,
  block_hash   TEXT        NOT NULL,
  nonce        BIGINT      NOT NULL,
  status       TEXT        NOT NULL,
  raw          JSONB       NOT NULL,
  indexed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transactions_signer_id_idx ON transactions (signer_id);
CREATE INDEX IF NOT EXISTS transactions_receiver_id_idx ON transactions (receiver_id);
CREATE INDEX IF NOT EXISTS transactions_block_height_idx ON transactions (block_height);