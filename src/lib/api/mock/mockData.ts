// Risposte fake casuali per simulare l'assistente AI
export const mockResponses = [
  "Ciao! Come posso aiutarti oggi?",
  "Sono qui per rispondere alle tue domande!",
  "Interessante! Dimmi di più su questo argomento.",
  "Capisco. Posso aiutarti con altre informazioni?",
  "Ottima domanda! Ecco cosa penso...",
  "Certamente! Sono felice di aiutarti con questo.",
  "Ho capito la tua richiesta. Lascia che ti spieghi...",
  "Questa è una questione importante. Vediamo insieme...",
];

// Funzione per ottenere una risposta casuale
export const getRandomResponse = (): string => {
  const index = Math.floor(Math.random() * mockResponses.length);
  return mockResponses[index];
};

// Sessioni fake per history (opzionale, useremo dopo)
export const mockSessions = [
  {
    id: "session-1",
    title: "Conversazione su React",
    createdAt: "2025-10-20T14:00:00Z",
    messageCount: 5,
  },
  {
    id: "session-2",
    title: "Domande su TypeScript",
    createdAt: "2025-10-21T10:30:00Z",
    messageCount: 3,
  },
  {
    id: "session-3",
    title: "Redux Toolkit Setup",
    createdAt: "2025-10-22T16:45:00Z",
    messageCount: 8,
  },
];
