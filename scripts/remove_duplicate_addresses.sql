-- Delete duplicate addresses, keeping the oldest one
DELETE FROM addresses a
USING addresses b
WHERE a.id > b.id 
  AND a."userId" = b."userId" 
  AND a.address1 = b.address1 
  AND a.city = b.city 
  AND a."postalCode" = b."postalCode";
