import { store } from "../../app/store";
import { addNotification } from "../../features/ui/uiSlice";
import { api } from "./client";

api.interceptors.request.use((config) => {
  // Opzionale: config.headers.Authorization = `Bearer ${token}`;
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Funzione di mapping errori HTTP → messaggi utente
    const getErrorMessage = (status: number): string => {
      switch (status) {
        case 401:
          return "Sessione scaduta. Effettua nuovamente il login.";
        case 403:
          return "Non hai i permessi per questa operazione.";
        case 404:
          return "Risorsa non trovata.";
        case 500:
          return "Errore del server. Riprova più tardi.";
        case 503:
          return "Servizio temporaneamente non disponibile.";
        default:
          return "Errore di connessione. Verifica la rete.";
      }
    };

    // Determina il messaggio di errore appropriato
    let errorMessage: string;

    if (error.code === "ECONNABORTED") {
      // Timeout
      errorMessage = "Richiesta troppo lenta. Verifica la connessione.";
    } else if (error.message === "Network Error" || !error.response) {
      // Errore di rete (no risposta dal server)
      errorMessage = "Errore di connessione. Verifica la rete.";
    } else {
      // Errore HTTP (4xx, 5xx)
      const status = error.response.status;
      errorMessage = getErrorMessage(status);
    }

    // Dispatch toast automatico
    store.dispatch(addNotification({ message: errorMessage, type: "error" }));

    // Log per debug (rimovibile in produzione)
    const status = error?.response?.status;
    if (status === 401) {
      console.error("401 Unauthorized - Sessione scaduta");
      // Redirect a login (opzionale)
      // window.location.href = "/login";
    } else if (status === 403) {
      console.error("403 Forbidden - Permessi insufficienti");
    } else if (status === 500) {
      console.error("500 Server Error");
    } else if (error.message === "Network Error") {
      console.error("Network Error - Nessuna connessione");
    } else if (error.code === "ECONNABORTED") {
      console.error("Timeout - Richiesta scaduta");
    } else {
      console.error("API Error:", error.message);
    }

    return Promise.reject(error);
  }
);
