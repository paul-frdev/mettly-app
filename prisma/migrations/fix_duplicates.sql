-- Delete duplicate clients keeping only the first one for each email
WITH ranked_clients AS
  (SELECT id,
          email,
          ROW_NUMBER() OVER (PARTITION BY email
                             ORDER BY "createdAt") as rn
   FROM "Client")
DELETE
FROM "Client"
WHERE id IN
    (SELECT id
     FROM ranked_clients
     WHERE rn > 1 );

-- Remove duplicate refCodes keeping only the first one
WITH ranked_users AS
  (SELECT id,
          ref_code,
          ROW_NUMBER() OVER (PARTITION BY ref_code
                             ORDER BY "createdAt") as rn
   FROM "users"
   WHERE ref_code IS NOT NULL )
UPDATE "users"
SET ref_code = NULL
WHERE id IN
    (SELECT id
     FROM ranked_users
     WHERE rn > 1 );