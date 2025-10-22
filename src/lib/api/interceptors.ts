import { api } from "./client";

api.interceptors.request.use((config) => {
  //   config.headers.Authorization = "B Token";
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      console.error("401 Unauthorized - Utente non autenticato");
      // TODO: Redirect to login quando avremo React Router
    } else if (status === 403) {
      console.error("403 Forbidden - Nessun permesso");
    } else if (status === 500) {
      console.error("500 Server Error");
    } else if (error.message === "Network Error") {
      console.error("Network Error - Nessuna connessione");
    } else {
      console.error("API Error:", error.message);
    }

    return Promise.reject(error);
  }
);
