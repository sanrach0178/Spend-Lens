CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_id VARCHAR(255) NOT NULL UNIQUE,
    tools_json TEXT NOT NULL,
    audit_result_json TEXT NOT NULL,
    total_monthly_savings DECIMAL(19, 2),
    total_annual_savings DECIMAL(19, 2),
    team_size INTEGER,
    primary_use_case VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    ip_hash VARCHAR(255) NOT NULL
);
