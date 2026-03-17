-- ============================================
-- Demo Seed Data
-- One trucking company tenant, 1 user, 5 customers
-- Safe to re-run (uses ON CONFLICT DO NOTHING / DO UPDATE)
-- ============================================

-- Tenant
INSERT INTO tenants (id, name, slug, plan, status) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Atlas Freight Co.', 'atlas-freight', 'free', 'active')
ON CONFLICT (id) DO NOTHING;

-- User — links your existing user to Atlas Freight tenant (updates if already exists)
INSERT INTO users (id, tenant_id, supabase_auth_user_id, email, full_name, role) VALUES
    ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
     '5460a6ed-0a63-4e31-94fd-d978dad80127', '25100215@lums.edu.pk', 'Ahmed', 'admin')
ON CONFLICT (supabase_auth_user_id) DO UPDATE SET
    tenant_id = EXCLUDED.tenant_id,
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;

-- Customers (unique per tenant + email)
INSERT INTO customers (tenant_id, company_name, contact_name, email, email_domain, segment, preferred_tone, account_notes, pricing_notes, status) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Awesome Solutions Inc.', 'Ahmed Awesome', 'ahmedawesome11@gmail.com', 'gmail.com',
     'mid-market', 'professional',
     'Test customer for demo purposes. Regular contact for project updates and collaboration.',
     'Standard pricing. Net-30 payment terms.',
     'active'),

    ('11111111-1111-1111-1111-111111111111', 'Personal Gmail Account', 'Ahmed', 'ahmedd.fz11@gmail.com', 'gmail.com',
     'small-business', 'friendly',
     'Personal email account used for testing. Prefers casual communication style.',
     'Standard pricing. No special terms.',
     'active'),

    ('11111111-1111-1111-1111-111111111111', 'GreenLeaf Logistics', 'Sarah Chen', 'sarah@greenleaf.com', 'greenleaf.com',
     'enterprise', 'formal',
     'Long-term partner since 2022. Handles West Coast routes. Prefers detailed quotes.',
     'Volume discount: 8%. Net-30 payment terms.',
     'active')
ON CONFLICT (tenant_id, email) DO NOTHING;

-- Default prompt config
INSERT INTO prompt_configs (tenant_id, name, system_prompt, instructions_json, is_active) VALUES
    (NULL, 'default-v1',
     'You are an AI email copilot for business communication.

Your job is to draft professional email replies that are concise, accurate, and grounded only in the provided context.

Rules:
- Do not invent facts, prices, deadlines, or commitments.
- If important information is missing, do not guess. List the missing details clearly.
- Match the requested tone.
- Keep replies practical and ready to send.
- Prefer short paragraphs.
- Include a clear next step when appropriate.',
     '["Do not promise discounts above 10 percent.", "Do not commit to delivery dates without confirmation.", "Prefer concise professional tone.", "If the request is unclear, ask at most 3 clarifying questions."]',
     true)
ON CONFLICT DO NOTHING;

-- Initialize usage counter
INSERT INTO usage_counters (tenant_id, month_key, drafts_generated, tokens_used, estimated_cost) VALUES
    ('11111111-1111-1111-1111-111111111111', '2026-03', 0, 0, 0.0)
ON CONFLICT (tenant_id, month_key) DO NOTHING;
