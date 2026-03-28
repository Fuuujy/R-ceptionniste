export interface Call {
  id: string;
  callerName: string;
  callerNumber: string;
  date: string; // ISO string
  duration: number; // in seconds
  summary: string;
  probleme?: string;
  heure_rdv?: string | null;
  transcript: { speaker: 'AI' | 'Caller'; text: string; time: string }[];
}

export const mockCalls: Call[] = [
  {
    id: 'eleven_1711648000000',
    callerName: 'Jean',
    callerNumber: '+33 6 12 34 56 78',
    date: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    duration: 145,
    summary: 'Le client a pris rendez-vous pour une consultation initiale mardi prochain à 14h.',
    probleme: 'Douleurs au dos depuis 3 jours',
    heure_rdv: 'Mardi à 14h00',
    transcript: [
      { speaker: 'AI', text: 'Bonjour, vous êtes bien au cabinet. Comment puis-je vous aider aujourd\'hui ?', time: '00:00' },
      { speaker: 'Caller', text: 'Bonjour, j\'aimerais prendre un rendez-vous pour une consultation.', time: '00:05' },
      { speaker: 'AI', text: 'Bien sûr. Quel est votre problème principal ?', time: '00:10' },
      { speaker: 'Caller', text: 'J\'ai des douleurs au dos depuis 3 jours.', time: '00:14' },
      { speaker: 'AI', text: 'D\'accord. J\'ai des disponibilités mardi prochain à 10h ou à 14h. Qu\'est-ce qui vous conviendrait le mieux ?', time: '00:18' },
      { speaker: 'Caller', text: 'Mardi à 14h, c\'est parfait.', time: '00:25' },
      { speaker: 'AI', text: 'C\'est noté. Pourriez-vous me donner votre prénom s\'il vous plaît ?', time: '00:28' },
      { speaker: 'Caller', text: 'Jean.', time: '00:32' },
      { speaker: 'AI', text: 'Merci Jean. Votre rendez-vous est confirmé pour mardi à 14h. Vous recevrez un SMS de confirmation. Bonne journée !', time: '00:35' },
    ]
  },
  {
    id: 'eleven_1711647000000',
    callerName: 'Marie',
    callerNumber: '+33 6 98 76 54 32',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    duration: 85,
    summary: 'La cliente demandait les horaires d\'ouverture. Information fournie.',
    probleme: 'Demande d\'horaires',
    heure_rdv: null,
    transcript: [
      { speaker: 'AI', text: 'Bonjour, vous êtes bien au cabinet. Comment puis-je vous aider aujourd\'hui ?', time: '00:00' },
      { speaker: 'Caller', text: 'Bonjour, je voulais juste savoir à quelle heure vous fermez ce soir ?', time: '00:06' },
      { speaker: 'AI', text: 'Nous sommes ouverts jusqu\'à 19h00 aujourd\'hui.', time: '00:12' },
      { speaker: 'Caller', text: 'Super, merci beaucoup !', time: '00:16' },
      { speaker: 'AI', text: 'Je vous en prie, bonne fin de journée.', time: '00:19' },
    ]
  },
  {
    id: 'eleven_1711646000000',
    callerName: 'Inconnu',
    callerNumber: 'Inconnu',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    duration: 210,
    summary: 'Le client avait une question technique complexe concernant sa facture. Appel transféré.',
    probleme: 'Erreur de facturation',
    heure_rdv: null,
    transcript: [
      { speaker: 'AI', text: 'Bonjour, vous êtes bien au cabinet. Comment puis-je vous aider aujourd\'hui ?', time: '00:00' },
      { speaker: 'Caller', text: 'Oui bonjour, j\'ai reçu une facture mais le montant ne correspond pas à mon devis.', time: '00:08' },
      { speaker: 'AI', text: 'Je comprends. Pourriez-vous me donner votre numéro de facture ?', time: '00:15' },
      { speaker: 'Caller', text: 'C\'est la FA-2023-405.', time: '00:22' },
      { speaker: 'AI', text: 'Merci. Les questions de facturation nécessitent l\'intervention de notre service comptabilité. Veuillez patienter, je vous transfère.', time: '00:28' },
    ]
  }
];

export const weeklyStats = [
  { name: 'Lun', calls: 45, avgDuration: 2.5 },
  { name: 'Mar', calls: 52, avgDuration: 3.1 },
  { name: 'Mer', calls: 38, avgDuration: 1.8 },
  { name: 'Jeu', calls: 65, avgDuration: 4.2 },
  { name: 'Ven', calls: 48, avgDuration: 2.9 },
  { name: 'Sam', calls: 15, avgDuration: 1.5 },
  { name: 'Dim', calls: 5, avgDuration: 1.0 },
];
