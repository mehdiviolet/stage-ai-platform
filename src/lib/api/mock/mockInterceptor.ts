import { api } from "../client";
import { handleChatAsk, type ChatRequest } from "./mockHandlers";

// Setup interceptor mock per simulare risposte API
export function setupMockInterceptor() {
  // Legge variabile ambiente
  const mockEnabled = import.meta.env.VITE_MOCK_ENABLED === "true";

  if (!mockEnabled) {
    console.log("🔴 Mock API disabilitato");
    return;
  }

  console.log("🟢 Mock API abilitato");

  // Configura response interceptor
  api.interceptors.response.use(
    // Passa risposte normali (se arrivano dal backend reale)
    (response) => response,

    // Intercetta errori e mocka risposte
    async (error) => {
      const url = error.config?.url || "";

      // Intercetta solo chiamate a /chat/ask
      if (url.includes("/chat/ask")) {
        console.log("🎭 Mock interceptor: catturata chiamata a /chat/ask");

        try {
          // Estrae body della request
          const requestBody: ChatRequest = JSON.parse(error.config.data);

          // Chiama handler mock
          const mockResponse = await handleChatAsk(requestBody);

          console.log("✅ Mock response:", mockResponse);

          // Costruisce risposta axios fake (formato corretto)
          return Promise.resolve({
            data: mockResponse,
            status: 200,
            statusText: "OK (Mock)",
            headers: {},
            config: error.config,
          });
        } catch (mockError) {
          console.error("❌ Errore nel mock handler:", mockError);
          return Promise.reject(mockError);
        }
      }

      // Altri errori → propagali normalmente
      return Promise.reject(error);
    }
  );
}
