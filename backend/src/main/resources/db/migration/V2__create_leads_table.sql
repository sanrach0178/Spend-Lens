CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    role VARCHAR(255),
    team_size INTEGER,
    is_high_savings BOOLEAN DEFAULT FALSE,
    email_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    honeypot VARCHAR(255)
);
