-- 1) S'assurer qu'on a au moins un client "demo"
WITH c AS (
  INSERT INTO clients(name, phone, email)
  VALUES ('Alice Martin', '+32470000001', 'alice@example.com')
  ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name
  RETURNING id AS client_id
),
-- 2) Récupérer les IDs des pizzas utilisées
p AS (
  SELECT
    (SELECT id FROM pizzas WHERE name = 'Margherita') AS margherita_id,
    (SELECT id FROM pizzas WHERE name = 'Regina')      AS regina_id
),
-- 3) Choisir un créneau (prend le plus tôt à partir d’aujourd’hui)
s AS (
  SELECT MIN(starts_at) AS scheduled_at
  FROM slots
  WHERE starts_at::date >= CURRENT_DATE
)
-- 4) Créer la commande avec items (JSON construit côté SQL)
SELECT create_order_with_items(
  (SELECT client_id FROM c),
  (SELECT scheduled_at FROM s),
  'Sans champignons',
  jsonb_build_array(
    jsonb_build_object('pizza_id', (SELECT margherita_id FROM p), 'qty', 2, 'price_eur', 12.50),
    jsonb_build_object('pizza_id', (SELECT regina_id FROM p),      'qty', 1, 'price_eur', 14.50)
  )
);
