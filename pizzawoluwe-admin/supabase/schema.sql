-- ============================================================
-- ThermoGestion Pro – Schéma Supabase (PostgreSQL)
-- Application de gestion pour artisan chauffagiste indépendant
-- ============================================================

-- Nettoyage des anciennes tables (pizza app)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS pizzas CASCADE;
DROP TABLE IF EXISTS slots CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS intervention_photos CASCADE;
DROP TABLE IF EXISTS combustion_measures CASCADE;
DROP TABLE IF EXISTS intervention_items CASCADE;
DROP TABLE IF EXISTS interventions CASCADE;
DROP TABLE IF EXISTS quote_items CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS catalog_items CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;

-- ============================================================
-- TABLE: clients (CRM – Fiches clients)
-- ============================================================
CREATE TABLE clients (
  id            bigserial PRIMARY KEY,
  first_name    text,
  last_name     text NOT NULL,
  phone         text,
  email         text,
  notes         text,
  created_at    timestamptz DEFAULT now() NOT NULL
);

-- ============================================================
-- TABLE: buildings (Lieux / Adresses des bâtiments)
-- Un client peut avoir plusieurs bâtiments.
-- L'année de construction détermine la TVA: >10 ans → 6%, sinon 21%.
-- ============================================================
CREATE TABLE buildings (
  id                  bigserial PRIMARY KEY,
  client_id           bigint REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  label               text DEFAULT 'Principal',
  address             text NOT NULL,
  city                text NOT NULL,
  postal_code         text,
  construction_year   int,           -- Clé pour le calcul TVA automatique
  boiler_brand        text,          -- Marque chaudière
  boiler_model        text,          -- Modèle chaudière
  boiler_serial       text,          -- Numéro de série
  boiler_type         text,          -- condensation | atmospherique | sol | mural
  boiler_power        numeric(8,2),  -- Puissance nominale (kW)
  gas_contract        text,          -- N° contrat gaz / compteur
  notes               text,
  created_at          timestamptz DEFAULT now() NOT NULL
);

-- ============================================================
-- TABLE: catalog_items (Catalogue : pièces, services, déplacements)
-- ============================================================
CREATE TABLE catalog_items (
  id              bigserial PRIMARY KEY,
  type            text CHECK (type IN ('part', 'service', 'travel')) NOT NULL,
  reference       text,
  barcode         text,
  name            text NOT NULL,
  description     text,
  purchase_price  numeric(10,2),
  sale_price      numeric(10,2) NOT NULL,
  stock           int DEFAULT 0,
  unit            text DEFAULT 'pce',    -- pce, h, forfait, m, L, kg
  active          boolean DEFAULT true,
  created_at      timestamptz DEFAULT now() NOT NULL
);

-- ============================================================
-- TABLE: quotes (Devis / Dossiers commerciaux)
-- Créé sans date d'intervention obligatoire.
-- ============================================================
CREATE TABLE quotes (
  id            bigserial PRIMARY KEY,
  number        text UNIQUE,
  client_id     bigint REFERENCES clients(id),
  building_id   bigint REFERENCES buildings(id),
  status        text DEFAULT 'draft'
                  CHECK (status IN ('draft','sent','accepted','rejected')),
  vat_rate      numeric(5,2) DEFAULT 21,    -- Calculé automatiquement (6 ou 21%)
  subtotal      numeric(10,2) DEFAULT 0,
  vat_amount    numeric(10,2) DEFAULT 0,
  total         numeric(10,2) DEFAULT 0,
  notes         text,
  valid_until   date,
  created_at    timestamptz DEFAULT now() NOT NULL
);

-- ============================================================
-- TABLE: quote_items (Lignes de devis)
-- ============================================================
CREATE TABLE quote_items (
  id                bigserial PRIMARY KEY,
  quote_id          bigint REFERENCES quotes(id) ON DELETE CASCADE NOT NULL,
  catalog_item_id   bigint REFERENCES catalog_items(id),
  description       text NOT NULL,
  quantity          numeric(10,2) DEFAULT 1,
  unit_price        numeric(10,2) NOT NULL,
  unit              text DEFAULT 'pce'
);

-- ============================================================
-- TABLE: interventions (Actes techniques planifiés)
-- Types: maintenance (entretien), repair (dépannage), installation
-- ============================================================
CREATE TABLE interventions (
  id                  bigserial PRIMARY KEY,
  number              text UNIQUE,
  quote_id            bigint REFERENCES quotes(id),
  client_id           bigint REFERENCES clients(id) NOT NULL,
  building_id         bigint REFERENCES buildings(id),
  type                text CHECK (type IN ('maintenance','repair','installation')) NOT NULL,
  status              text DEFAULT 'planned'
                        CHECK (status IN ('planned','in_progress','completed','cancelled')),
  scheduled_at        timestamptz,         -- Facultatif à la création d'un devis
  completed_at        timestamptz,
  technician_notes    text,
  client_signature    text,                -- Base64 de la signature tactile client
  vat_rate            numeric(5,2) DEFAULT 21,
  subtotal            numeric(10,2) DEFAULT 0,
  vat_amount          numeric(10,2) DEFAULT 0,
  total               numeric(10,2) DEFAULT 0,
  created_at          timestamptz DEFAULT now() NOT NULL
);

-- ============================================================
-- TABLE: combustion_measures (Analyse de combustion)
-- Rendement calculé par formule de Siegert (DIN 4702).
-- Conformité selon normes bruxelloises.
-- ============================================================
CREATE TABLE combustion_measures (
  id                  bigserial PRIMARY KEY,
  intervention_id     bigint REFERENCES interventions(id) ON DELETE CASCADE NOT NULL,
  flue_temp           numeric(6,1),             -- Température fumées Tg (°C)
  ambient_temp        numeric(6,1) DEFAULT 20,  -- Température air comburant Tl (°C)
  o2_rate             numeric(5,2),             -- O₂ (%)
  co_ppm              numeric(8,1),             -- CO (ppm)
  co2_rate            numeric(5,2),             -- CO₂ (%)
  lambda              numeric(5,3),             -- Coefficient d'excès d'air λ
  efficiency          numeric(5,2),             -- Rendement η calculé Siegert (%)
  conformity_status   text CHECK (conformity_status IN ('green','orange','red')),
  measured_at         timestamptz DEFAULT now() NOT NULL
);

-- ============================================================
-- TABLE: intervention_items (Pièces et services utilisés)
-- ============================================================
CREATE TABLE intervention_items (
  id                bigserial PRIMARY KEY,
  intervention_id   bigint REFERENCES interventions(id) ON DELETE CASCADE NOT NULL,
  catalog_item_id   bigint REFERENCES catalog_items(id),
  description       text NOT NULL,
  quantity          numeric(10,2) DEFAULT 1,
  unit_price        numeric(10,2) NOT NULL,
  unit              text DEFAULT 'pce'
);

-- ============================================================
-- TABLE: intervention_photos (Photos avant / après chantier)
-- ============================================================
CREATE TABLE intervention_photos (
  id                bigserial PRIMARY KEY,
  intervention_id   bigint REFERENCES interventions(id) ON DELETE CASCADE NOT NULL,
  data_url          text NOT NULL,      -- base64 data URL ou lien Supabase Storage
  type              text DEFAULT 'other' CHECK (type IN ('before','after','other')),
  caption           text,
  created_at        timestamptz DEFAULT now() NOT NULL
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE combustion_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_all" ON clients             FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON buildings           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON catalog_items       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON quotes              FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON quote_items         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON interventions       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON combustion_measures FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON intervention_items  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON intervention_photos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- FONCTIONS
-- ============================================================

-- Génération numéro devis (D-0001, D-0002, ...)
CREATE OR REPLACE FUNCTION next_quote_number()
RETURNS text AS $$
DECLARE v_num int;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 3) AS int)), 0) + 1
  INTO v_num FROM quotes WHERE number ~ '^D-[0-9]+$';
  RETURN 'D-' || LPAD(v_num::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Génération numéro intervention (I-0001, I-0002, ...)
CREATE OR REPLACE FUNCTION next_intervention_number()
RETURNS text AS $$
DECLARE v_num int;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 3) AS int)), 0) + 1
  INTO v_num FROM interventions WHERE number ~ '^I-[0-9]+$';
  RETURN 'I-' || LPAD(v_num::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Recalcul total intervention
CREATE OR REPLACE FUNCTION recalc_intervention_total(p_id bigint)
RETURNS void AS $$
DECLARE v_sub numeric; v_vat numeric; v_rate numeric;
BEGIN
  SELECT COALESCE(SUM(quantity * unit_price), 0) INTO v_sub
  FROM intervention_items WHERE intervention_id = p_id;
  SELECT vat_rate INTO v_rate FROM interventions WHERE id = p_id;
  v_vat := ROUND(v_sub * v_rate / 100, 2);
  UPDATE interventions SET subtotal=v_sub, vat_amount=v_vat, total=v_sub+v_vat WHERE id=p_id;
END;
$$ LANGUAGE plpgsql;

-- Recalcul total devis
CREATE OR REPLACE FUNCTION recalc_quote_total(p_id bigint)
RETURNS void AS $$
DECLARE v_sub numeric; v_vat numeric; v_rate numeric;
BEGIN
  SELECT COALESCE(SUM(quantity * unit_price), 0) INTO v_sub
  FROM quote_items WHERE quote_id = p_id;
  SELECT vat_rate INTO v_rate FROM quotes WHERE id = p_id;
  v_vat := ROUND(v_sub * v_rate / 100, 2);
  UPDATE quotes SET subtotal=v_sub, vat_amount=v_vat, total=v_sub+v_vat WHERE id=p_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- VUES
-- ============================================================

-- Vue enrichie des interventions
CREATE OR REPLACE VIEW interventions_view AS
SELECT
  i.id, i.number, i.type, i.status,
  i.scheduled_at, i.completed_at,
  i.total, i.subtotal, i.vat_rate, i.vat_amount,
  i.technician_notes, i.created_at,
  c.first_name || ' ' || c.last_name AS client_name,
  c.phone AS client_phone,
  c.email AS client_email,
  b.label AS building_label,
  b.address AS building_address,
  b.city AS building_city,
  b.construction_year,
  b.boiler_brand, b.boiler_model, b.boiler_serial
FROM interventions i
LEFT JOIN clients c ON c.id = i.client_id
LEFT JOIN buildings b ON b.id = i.building_id;

-- Vue enrichie des devis
CREATE OR REPLACE VIEW quotes_view AS
SELECT
  q.id, q.number, q.status,
  q.vat_rate, q.subtotal, q.vat_amount, q.total,
  q.notes, q.valid_until, q.created_at,
  c.first_name || ' ' || c.last_name AS client_name,
  c.phone AS client_phone,
  b.address AS building_address,
  b.city AS building_city,
  b.construction_year
FROM quotes q
LEFT JOIN clients c ON c.id = q.client_id
LEFT JOIN buildings b ON b.id = q.building_id;
