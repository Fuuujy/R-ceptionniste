# Réceptionniste IA — Dashboard

Dashboard pour recevoir et afficher les données des appels de ton agent ElevenLabs.

## Déploiement rapide sur Railway (gratuit)

1. Va sur https://railway.app et crée un compte (gratuit)
2. Clique "New Project" → "Deploy from GitHub"
3. Upload ce dossier sur GitHub d'abord, ou utilise "Deploy from local"
4. Railway détecte automatiquement Node.js et lance `npm start`
5. Tu obtiens une URL publique : `https://ton-app.railway.app`

## Déploiement sur Render (gratuit)

1. Va sur https://render.com
2. "New Web Service" → connecte GitHub
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. URL publique générée automatiquement

## Configuration n8n

Dans le nœud HTTP Request de n8n (après l'appel ElevenLabs) :
- Method: POST  
- URL: https://ton-app.railway.app/api/appel
- Body JSON:
```json
{
  "prenom": "{{ $json.prenom }}",
  "nom": "{{ $json.nom }}",
  "telephone": "{{ $json.telephone }}",
  "probleme": "{{ $json.probleme }}",
  "heure_rdv": "{{ $json.heure_rdv }}",
  "resume": "{{ $json.resume }}",
  "duree": "{{ $json.duree }}",
  "statut": "nouveau"
}
```

## Test local

```bash
npm install
node server.js
# Ouvre http://localhost:3000
```

## Endpoint API

- `POST /api/appel` — Reçoit les données d'un appel
- `GET /api/appels` — Retourne tous les appels
- `POST /api/test` — Ajoute des données de test
