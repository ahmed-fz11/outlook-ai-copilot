-- ============================================
-- Outlook AI Copilot SaaS — Initial Schema
-- Run against Supabase Postgres
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------
-- Tenants (company / workspace)
-- ----------------------------
CREATE TABLE tenants (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    plan        VARCHAR(50) DEFAULT 'free',
    status      VARCHAR(50) DEFAULT 'active',
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------
-- Users (app-level, linked to Supabase Auth)
-- ----------------------------
CREATE TABLE users (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id               UUID NOT NULL REFERENCES tenants(id),
    supabase_auth_user_id   VARCHAR(255) UNIQUE NOT NULL,
    email                   VARCHAR(255) NOT NULL,
    full_name               VARCHAR(255) DEFAULT '',
    role                    VARCHAR(50) DEFAULT 'member',
    created_at              TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_supabase_uid ON users(supabase_auth_user_id);

-- ----------------------------
-- Customers (sender-side contacts your AI references)
-- ----------------------------
CREATE TABLE customers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    company_name    VARCHAR(255) NOT NULL,
    contact_name    VARCHAR(255) DEFAULT '',
    email           VARCHAR(255) DEFAULT '',
    email_domain    VARCHAR(255) DEFAULT '',
    segment         VARCHAR(100) DEFAULT 'standard',
    preferred_tone  VARCHAR(50) DEFAULT 'professional',
    account_notes   TEXT,
    pricing_notes   TEXT,
    status          VARCHAR(50) DEFAULT 'active',
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_customers_tenant ON customers(tenant_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_domain ON customers(email_domain);

-- ----------------------------
-- Email Events (analyzed emails)
-- ----------------------------
CREATE TABLE email_events (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id),
    user_id             UUID NOT NULL REFERENCES users(id),
    outlook_message_ref VARCHAR(512),
    sender_email        VARCHAR(255) NOT NULL,
    subject             VARCHAR(1000) DEFAULT '',
    raw_email_text      TEXT,
    summary_text        TEXT,
    created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_email_events_tenant ON email_events(tenant_id);
CREATE INDEX idx_email_events_user ON email_events(user_id);

-- ----------------------------
-- Drafts (AI-generated replies)
-- ----------------------------
CREATE TABLE drafts (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id         UUID NOT NULL REFERENCES tenants(id),
    user_id           UUID NOT NULL REFERENCES users(id),
    email_event_id    UUID NOT NULL REFERENCES email_events(id),
    model_name        VARCHAR(100) DEFAULT 'gpt-4o-mini',
    prompt_version    VARCHAR(50) DEFAULT 'v1',
    generated_draft   TEXT,
    missing_info_json JSONB,
    token_input       INTEGER DEFAULT 0,
    token_output      INTEGER DEFAULT 0,
    estimated_cost    DOUBLE PRECISION DEFAULT 0.0,
    created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_drafts_tenant ON drafts(tenant_id);
CREATE INDEX idx_drafts_email_event ON drafts(email_event_id);

-- ----------------------------
-- Prompt Configs (versioned prompts)
-- ----------------------------
CREATE TABLE prompt_configs (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id         UUID REFERENCES tenants(id),  -- NULL = global default
    name              VARCHAR(255) NOT NULL,
    system_prompt     TEXT,
    instructions_json JSONB,
    is_active         BOOLEAN DEFAULT true,
    created_at        TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------
-- Usage Counters (per tenant per month)
-- ----------------------------
CREATE TABLE usage_counters (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id        UUID NOT NULL REFERENCES tenants(id),
    month_key        VARCHAR(7) NOT NULL,  -- e.g. '2026-03'
    drafts_generated INTEGER DEFAULT 0,
    tokens_used      INTEGER DEFAULT 0,
    estimated_cost   DOUBLE PRECISION DEFAULT 0.0,
    UNIQUE(tenant_id, month_key)
);
