-- ============================================================
-- ThermoGestion Pro – Données de démonstration
-- ============================================================

-- Clients demo
INSERT INTO clients (first_name, last_name, phone, email, notes) VALUES
  ('Marie', 'Dupont', '+32470123456', 'marie.dupont@gmail.com', 'Cliente fidèle depuis 2018'),
  ('Jean-Pierre', 'Lambert', '+32495678901', 'jplam@hotmail.com', 'Préférence contact SMS'),
  ('Sophie', 'Marchal', '+32486543210', 'sophie.marchal@outlook.be', NULL),
  ('Ahmed', 'Bensalem', '+32477000111', 'abensalem@gmail.com', 'Parle français et arabe');

-- Bâtiments demo (avec années de construction pour la TVA)
INSERT INTO buildings (client_id, label, address, city, postal_code, construction_year,
  boiler_brand, boiler_model, boiler_serial, boiler_type, boiler_power) VALUES
  (1, 'Domicile', 'Rue de la Paix 12', 'Bruxelles', '1000', 1985,
   'Vaillant', 'ecoTEC plus VC 256', 'SN-2018-00456', 'condensation', 25.0),
  (1, 'Garage', 'Rue de la Paix 14', 'Bruxelles', '1000', 2005,
   NULL, NULL, NULL, NULL, NULL),
  (2, 'Principal', 'Avenue Louise 78', 'Ixelles', '1050', 1968,
   'Buderus', 'Logamax GB172-24', 'SN-BUD-33291', 'condensation', 24.0),
  (3, 'Appartement', 'Chaussée de Waterloo 201', 'Saint-Gilles', '1060', 2015,
   'Daikin', 'Altherma 3 M', NULL, 'pompe_chaleur', 8.0),
  (4, 'Maison', 'Rue Vanderkindere 55', 'Uccle', '1180', 1978,
   'De Dietrich', 'MCR 3 Plus 24', 'SN-DD-44512', 'atmospherique', 24.0);

-- Catalogue – pièces fréquentes
INSERT INTO catalog_items (type, reference, name, description, purchase_price, sale_price, stock, unit) VALUES
  ('part', 'F-RBT-001', 'Robinet de radiateur TRV', 'Robinet thermostatique 3/4"', 18.50, 45.00, 12, 'pce'),
  ('part', 'F-JNT-002', 'Joint torique chaudière', 'Set joints universal chaudière', 3.20, 12.00, 50, 'pce'),
  ('part', 'F-IGN-003', 'Électrode d''allumage Vaillant', 'Réf. 0020132707', 22.00, 65.00, 5, 'pce'),
  ('part', 'F-PMP-004', 'Pompe de circulation Grundfos UP 15-50', 'Pompe chauffage central', 85.00, 195.00, 3, 'pce'),
  ('part', 'F-FLT-005', 'Filtre magnétique Fernox TF1', 'Protection circuit', 68.00, 145.00, 4, 'pce'),
  ('part', 'F-SND-006', 'Sonde NTC départ', 'Sonde température Vaillant/Buderus', 15.00, 42.00, 8, 'pce'),
  ('part', 'F-VLV-007', 'Vanne 3 voies motorisée', 'Vanne zone 1"', 55.00, 120.00, 2, 'pce'),
  ('part', 'F-PRG-008', 'Purgeur automatique 3/8"', 'Purgeur laiton automatique', 4.50, 15.00, 20, 'pce'),
  ('service', 'S-ENT-001', 'Entretien chaudière gaz', 'Entretien annuel complet avec rapport de combustion', NULL, 180.00, 0, 'forfait'),
  ('service', 'S-DEP-001', 'Dépannage – première heure', 'Intervention urgente, main d''œuvre 1h', NULL, 95.00, 0, 'h'),
  ('service', 'S-DEP-002', 'Dépannage – heure supplémentaire', 'Main d''œuvre heure supplémentaire', NULL, 75.00, 0, 'h'),
  ('service', 'S-INS-001', 'Installation chaudière', 'Pose et mise en service chaudière (MO uniquement)', NULL, 450.00, 0, 'forfait'),
  ('service', 'S-ANT-001', 'Antigel circuit', 'Traitement antigel Fernox F1', NULL, 55.00, 0, 'forfait'),
  ('travel', 'T-DEP-001', 'Frais de déplacement – zone Bruxelles', 'Déplacement intra-bruxellois', NULL, 25.00, 0, 'forfait'),
  ('travel', 'T-DEP-002', 'Frais de déplacement – hors Bruxelles', 'Déplacement péri-bruxellois (par tranche 20km)', NULL, 40.00, 0, 'forfait');

-- Intervention demo – entretien complété
INSERT INTO interventions (number, client_id, building_id, type, status, scheduled_at, completed_at,
  vat_rate, subtotal, vat_amount, total, technician_notes) VALUES
  ('I-0001', 1, 1, 'maintenance', 'completed',
   NOW() - interval '30 days', NOW() - interval '30 days' + interval '2 hours',
   6, 180.00, 10.80, 190.80,
   'Entretien annuel effectué. Nettoyage échangeur, vérification brûleur, test combustion. RAS.');

-- Mesure de combustion associée
INSERT INTO combustion_measures (intervention_id, flue_temp, ambient_temp, o2_rate, co_ppm, co2_rate, lambda, efficiency, conformity_status) VALUES
  (1, 68.5, 19.0, 4.2, 32, 9.8, 1.25, 91.2, 'green');

-- Items de l'intervention
INSERT INTO intervention_items (intervention_id, catalog_item_id, description, quantity, unit_price, unit) VALUES
  (1, 9, 'Entretien chaudière gaz', 1, 180.00, 'forfait'),
  (1, 14, 'Frais de déplacement – zone Bruxelles', 1, 25.00, 'forfait');

-- Devis demo
INSERT INTO quotes (number, client_id, building_id, status, vat_rate, subtotal, vat_amount, total, notes, valid_until) VALUES
  ('D-0001', 2, 3, 'sent', 6, 320.00, 19.20, 339.20,
   'Remplacement pompe de circulation défectueuse + antigel circuit',
   CURRENT_DATE + interval '30 days');

INSERT INTO quote_items (quote_id, catalog_item_id, description, quantity, unit_price, unit) VALUES
  (1, 4, 'Pompe de circulation Grundfos UP 15-50', 1, 195.00, 'pce'),
  (1, 10, 'Dépannage – première heure (pose pompe)', 1, 95.00, 'h'),
  (1, 13, 'Traitement antigel Fernox F1', 1, 55.00, 'forfait');
