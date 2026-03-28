const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Stockage en mémoire (remplace par une vraie DB plus tard)
let appels = [];

// Endpoint qui reçoit les données depuis n8n
app.post('/api/appel', (req, res) => {
  const data = req.body;
  const appel = {
    id: Date.now(),
    date: new Date().toISOString(),
    prenom: data.prenom || 'Inconnu',
    nom: data.nom || '',
    telephone: data.telephone || '',
    probleme: data.probleme || '',
    heure_rdv: data.heure_rdv || '',
    resume: data.resume || '',
    duree: data.duree || '',
    statut: data.statut || 'nouveau'
  };
  appels.unshift(appel);
  console.log('Nouvel appel reçu:', appel);
  res.json({ success: true, appel });
});

// Endpoint pour récupérer tous les appels (utilisé par le dashboard)
app.get('/api/appels', (req, res) => {
  res.json(appels);
});

// Endpoint de test
app.post('/api/test', (req, res) => {
  const fakeAppels = [
    {
      id: 1,
      date: new Date().toISOString(),
      prenom: 'Sophie',
      nom: 'Martin',
      telephone: '06 12 34 56 78',
      probleme: 'Consultation générale',
      heure_rdv: 'Lundi 14h',
      resume: 'La patiente souhaite un bilan de santé général. Première visite.',
      duree: '2min 34s',
      statut: 'nouveau'
    },
    {
      id: 2,
      date: new Date(Date.now() - 3600000).toISOString(),
      prenom: 'Marc',
      nom: 'Dupont',
      telephone: '07 98 76 54 32',
      probleme: 'Renouvellement ordonnance',
      heure_rdv: 'Mardi 10h',
      resume: 'Patient souhaite renouveler son ordonnance pour hypertension.',
      duree: '1min 12s',
      statut: 'confirmé'
    },
    {
      id: 3,
      date: new Date(Date.now() - 7200000).toISOString(),
      prenom: 'Julie',
      nom: 'Bernard',
      telephone: '06 55 44 33 22',
      probleme: 'Douleurs au dos',
      heure_rdv: 'Mercredi 9h30',
      resume: 'Patiente avec douleurs lombaires depuis 1 semaine. Urgence modérée.',
      duree: '3min 05s',
      statut: 'nouveau'
    }
  ];
  appels = [...fakeAppels, ...appels];
  res.json({ success: true, message: '3 appels de test ajoutés' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Dashboard démarré sur http://localhost:${PORT}`);
});
