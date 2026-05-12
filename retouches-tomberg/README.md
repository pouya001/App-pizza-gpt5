# Retouches Tomberg — Site vitrine

Site vitrine de l'atelier Retouches Tomberg, Woluwe-Saint-Lambert (Bruxelles).

**Stack :** Next.js 16 · TypeScript · Tailwind CSS v4 · lucide-react  
**Hébergement :** Vercel  
**Domaine cible :** `retouches-tomberg.be`

---

## Démarrage en local

```bash
# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env.local

# Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

---

## Mettre à jour le contenu

Tout le contenu modifiable se trouve dans le dossier `/data/` — aucune connaissance de React ou TypeScript n'est nécessaire pour ces fichiers.

### Modifier les tarifs

Éditer `/data/pricing.json`. Exemple :

```json
{
  "id": "ourlet-simple",
  "labelFr": "Ourlet pantalon simple",
  "priceFr": "15 €",
  "priceValue": 15
}
```

- Pour afficher "Devis gratuit" : mettre `"priceFr": "Devis gratuit"` et `"priceValue": null`
- Pour afficher un prix : mettre `"priceFr": "15 €"` et `"priceValue": 15`

### Modifier les horaires

Éditer `/data/hours.json`. Le champ `closed: true` = jour fermé, `open` et `close` = heures au format `"HH:MM"`.

### Modifier les coordonnées

Éditer `/data/site-config.json` — adresse, téléphones, URLs Google Maps, etc.

### Modifier les services

Éditer `/data/services.json`. Le champ `featured: true` affiche le badge "Spécialité" sur la carte.

---

## Structure du projet

```
retouches-tomberg/
├── app/
│   ├── layout.tsx              # Layout global, métadonnées, Schema.org JSON-LD
│   ├── page.tsx                # Page d'accueil (one-pager)
│   ├── sitemap.ts              # Sitemap XML auto-généré
│   ├── opengraph-image.tsx     # Image OG dynamique
│   ├── globals.css             # Variables CSS, palette de couleurs
│   ├── mentions-legales/
│   └── politique-confidentialite/
├── components/
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── Services.tsx
│   │   ├── Pricing.tsx
│   │   ├── Hours.tsx
│   │   ├── WhyUs.tsx
│   │   ├── Reviews.tsx
│   │   └── Contact.tsx
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── OpenStatus.tsx          # Badge "Ouvert / Fermé" temps réel
│   └── MapEmbed.tsx            # Carte Google Maps avec consentement RGPD
├── data/
│   ├── services.json
│   ├── pricing.json
│   ├── hours.json
│   └── site-config.json
├── lib/
│   ├── hours.ts                # Logique calcul ouvert/fermé
│   └── utils.ts                # Fonctions utilitaires
├── messages/
│   ├── fr.json                 # Traductions françaises (à intégrer en v1.1)
│   └── nl.json                 # Traductions néerlandaises (à intégrer en v1.1)
└── public/
    ├── images/                 # Photos à fournir par le client
    └── robots.txt
```

---

## Déploiement sur Vercel

1. Pousser le code sur GitHub
2. Sur [vercel.com](https://vercel.com), créer un nouveau projet
3. Sélectionner le repo GitHub, définir le **Root Directory** sur `retouches-tomberg`
4. Ajouter les variables d'environnement depuis `.env.example`
5. Déployer

### Connecter le domaine

1. Acheter `retouches-tomberg.be` (registrar belge recommandé : Combell, EurID)
2. Dans Vercel → Settings → Domains, ajouter `retouches-tomberg.be`
3. Configurer les DNS selon les instructions Vercel

---

## Google Business Profile — actions côté client

**Critique pour le SEO local — à faire après la mise en ligne :**

1. Revendiquer/vérifier la fiche Google Business Profile existante
2. Ajouter l'URL du site : `https://retouches-tomberg.be`
3. Compléter les horaires, services, description
4. Ajouter photos haute résolution (devanture, intérieur, réalisations cuir)
5. Encourager les clients à laisser des avis Google

---

## Checklist avant livraison

- [ ] Adresse exacte confirmée (93 ou 95 Tomberg)
- [ ] Horaires confirmés par le gérant (mettre à jour `data/hours.json`)
- [ ] Tarifs indicatifs remplis dans `data/pricing.json`
- [ ] Photos réelles ajoutées dans `public/images/`
- [ ] Numéro BCE / TVA complété dans `app/mentions-legales/page.tsx`
- [ ] Domaine `retouches-tomberg.be` acheté et connecté
- [ ] Google Business Profile mis à jour

---

## Roadmap v1.1

- Version néerlandaise complète (fichiers `/messages/*.json` déjà préparés)
- Galerie photos `/galerie`
- Intégration avis Google via Places API
- CMS headless (Decap/Sanity) pour autonomie du gérant
