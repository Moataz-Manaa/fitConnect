CREATE TABLE IF NOT EXISTS checkout_purchase (
    id VARCHAR(36) NOT NULL,
    client_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    kind VARCHAR(16) NOT NULL,
    state VARCHAR(16) NOT NULL,
    description VARCHAR(255) NOT NULL,
    unit_amount BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL,
    activation_date DATE NULL,
    provider_session_id VARCHAR(255) NOT NULL,
    provider_url VARCHAR(2048) NULL,
    result_id BIGINT NULL,
    confirmed_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY checkout_provider_session (provider_session_id),
    KEY checkout_product_state (kind, product_id, state),
    KEY checkout_client_state (client_id, state)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
