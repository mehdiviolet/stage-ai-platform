import { getRandomResponse } from "./mockData";

// Tipi per request/response (corrispondono alla guida sezione 7.2)
export type ChatRequest = {
  message: string;
  sessionId?: string;
  options?: Record<string, unknown>;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
};

export type ChatResponse = {
  message: ChatMessage;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
};

// Handler per POST /chat/ask
export async function handleChatAsk(
  request: ChatRequest
): Promise<ChatResponse> {
  // Simula latenza rete realistica (500ms)
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Genera risposta fake
  const responseContent = getRandomResponse();

  // Simula conteggio token (fake)
  const promptTokens = Math.floor(request.message.length / 4); // ~4 char per token
  const completionTokens = Math.floor(responseContent.length / 4);

  // Costruisce risposta nel formato atteso da Redux
  const response: ChatResponse = {
    message: {
      id: crypto.randomUUID(),
      role: "assistant",
      content: responseContent,
      createdAt: new Date().toISOString(),
    },
    usage: {
      promptTokens,
      completionTokens,
    },
  };

  return response;
}
