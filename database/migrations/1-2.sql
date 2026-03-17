-- Remove duplicate customers (keep one per tenant_id + email, preferring oldest)
DELETE FROM customers c1
USING customers c2
WHERE c1.tenant_id = c2.tenant_id
  AND c1.email = c2.email
  AND c1.id > c2.id;

-- Prevent future duplicates
ALTER TABLE customers ADD CONSTRAINT customers_tenant_email_unique UNIQUE (tenant_id, email);
