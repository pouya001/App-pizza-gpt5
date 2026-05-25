# Générateur d'évaluations

Web app qui transforme des photos de cours en évaluations Word prêtes à imprimer, avec un corrigé pour parent.

## Installation locale

```bash
npm install
cp .env.local.example .env.local
# Édite .env.local et ajoute ta clé API Anthropic
npm run dev
```

Ouvre http://localhost:3000

## Obtenir une clé API Anthropic

1. Va sur https://console.anthropic.com/
2. Crée un compte (carte de crédit requise — il faut prépayer du crédit)
3. Crée une clé API et copie-la dans `.env.local`

Coût indicatif : ~0,10-0,20€ par évaluation générée avec claude-opus-4-7.

## Déploiement Vercel

1. Push le code sur GitHub
2. Importe le repo dans Vercel
3. Dans les Environment Variables, ajoute `ANTHROPIC_API_KEY`
4. Deploy

**Important** : sur le plan Hobby (gratuit), les fonctions ont un timeout de 10s, ce qui ne suffit pas. Il faut un plan Pro pour gérer les 30-90s d'attente Claude.

## Modèles Claude supportés

Variable d'env optionnelle `ANTHROPIC_MODEL` :
- `claude-opus-4-7` (par défaut, qualité max, plus cher)
- `claude-sonnet-4-6` (moins cher, qualité quasi équivalente)
