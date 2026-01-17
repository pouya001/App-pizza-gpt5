-- Script pour créer automatiquement les créneaux pour les 30 prochains jours
-- Horaires : 11h00 à 23h30, par tranches de 30 minutes
-- Exécuter ce script dans Supabase SQL Editor

-- Supprimer les anciens créneaux (optionnel, commentez si vous voulez les garder)
-- DELETE FROM slots;

-- Générer les créneaux pour les 30 prochains jours
DO $$
DECLARE
  jour DATE;
  heure INT;
  minute INT;
  slot_time TIMESTAMPTZ;
BEGIN
  -- Boucle sur les 30 prochains jours
  FOR jour IN
    SELECT CURRENT_DATE + i
    FROM generate_series(0, 29) AS i
  LOOP
    -- Boucle sur les heures (11h à 23h)
    FOR heure IN 11..23 LOOP
      -- Pour chaque heure, créer les créneaux :00 et :30
      FOR minute IN 0..1 LOOP
        slot_time := jour + (heure || ':' || (minute * 30) || ':00')::TIME;

        -- Ne pas créer le créneau 24h00 (minuit)
        IF NOT (heure = 23 AND minute = 1) THEN
          -- Insérer le créneau s'il n'existe pas déjà
          INSERT INTO slots (starts_at, max_orders, max_pizzas, blocked, reason)
          VALUES (
            slot_time,
            3,     -- Maximum 3 commandes par créneau
            6,     -- Maximum 6 pizzas par créneau
            false, -- Non bloqué par défaut
            NULL
          )
          ON CONFLICT DO NOTHING;
        END IF;
      END LOOP;
    END LOOP;

    -- Ajouter aussi le créneau 23h30
    slot_time := jour + '23:30:00'::TIME;
    INSERT INTO slots (starts_at, max_orders, max_pizzas, blocked, reason)
    VALUES (slot_time, 3, 6, false, NULL)
    ON CONFLICT DO NOTHING;
  END LOOP;

  RAISE NOTICE 'Créneaux créés avec succès !';
END $$;

-- Vérifier le nombre de créneaux créés
SELECT COUNT(*) AS total_slots FROM slots;

-- Afficher les créneaux d'aujourd'hui (pour vérifier)
SELECT
  id,
  TO_CHAR(starts_at, 'YYYY-MM-DD HH24:MI') AS heure,
  max_orders,
  max_pizzas,
  blocked
FROM slots
WHERE starts_at::DATE = CURRENT_DATE
ORDER BY starts_at
LIMIT 10;
