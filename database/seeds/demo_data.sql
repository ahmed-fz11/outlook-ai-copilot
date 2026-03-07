-- ============================================
-- Demo Seed Data
-- One trucking company tenant, 1 user, 5 customers
-- ============================================

-- Tenant
INSERT INTO tenants (id, name, slug, plan, status) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Atlas Freight Co.', 'atlas-freight', 'free', 'active');

-- User (supabase_auth_user_id will be replaced with real UID after Supabase Auth setup)
INSERT INTO users (id, tenant_id, supabase_auth_user_id, email, full_name, role) VALUES
    ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
     'REPLACE_WITH_SUPABASE_UID', 'demo@atlasfreight.com', 'Alex Demo', 'admin');

-- Customers
INSERT INTO customers (tenant_id, company_name, contact_name, email, email_domain, segment, preferred_tone, account_notes, pricing_notes, status) VALUES
    ('11111111-1111-1111-1111-111111111111', 'GreenLeaf Logistics', 'Sarah Chen', 'sarah@greenleaf.com', 'greenleaf.com',
     'enterprise', 'formal',
     'Long-term partner since 2022. Handles West Coast routes. Prefers detailed quotes.',
     'Volume discount: 8%. Net-30 payment terms.',
     'active'),

    ('11111111-1111-1111-1111-111111111111', 'QuickHaul Inc.', 'Mike Torres', 'mike@quickhaul.io', 'quickhaul.io',
     'mid-market', 'professional',
     'New client since Q4 2025. Interested in refrigerated transport. Decision-maker is VP of Ops.',
     'Standard pricing. No discount yet. Net-15 terms.',
     'active'),

    ('11111111-1111-1111-1111-111111111111', 'Bayview Manufacturing', 'Priya Patel', 'priya@bayviewmfg.com', 'bayviewmfg.com',
     'enterprise', 'professional',
     'High-value client. Monthly shipments. Sensitive to delivery delays. Escalate issues to account manager.',
     'Contracted rate: $2.15/mile. Volume commitment: 50 loads/month.',
     'active'),

    ('11111111-1111-1111-1111-111111111111', 'Summit Supply Co.', 'James Wright', 'james@summitsupply.net', 'summitsupply.net',
     'small-business', 'friendly',
     'Small but growing account. Owner-operated. Prefers phone for urgent matters.',
     'Standard rate card. No special terms.',
     'active'),

    ('11111111-1111-1111-1111-111111111111', 'Coastal Distributors', 'Dana Kim', 'dana@coastaldist.com', 'coastaldist.com',
     'mid-market', 'concise',
     'Regional distributor. Uses our LTL service primarily. Previously had a billing dispute (resolved).',
     'Discount: 5% on LTL. Net-30 terms. Watch for payment delays.',
     'active');

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
     true);

-- Initialize usage counter
INSERT INTO usage_counters (tenant_id, month_key, drafts_generated, tokens_used, estimated_cost) VALUES
    ('11111111-1111-1111-1111-111111111111', '2026-03', 0, 0, 0.0);
