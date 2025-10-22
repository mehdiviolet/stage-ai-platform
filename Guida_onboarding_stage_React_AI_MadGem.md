# Guida per lo Sviluppatore in Stage
**Progetto:** Piattaforma web React.js per l’interazione con un modello di IA (stile ChatGPT) con integrazione a *MadGem*  
**Committer:** Team Giacomo  
**Versione:** 1.0 — 20/10/2025

---

## 1) Obiettivi formativi
- Comprendere architettura e flusso di un’app React SPA con integrazione a un servizio di IA (MadGem).
- Saper gestire stato globale con Redux Toolkit e integrazione con chiamate API.
- Conoscere differenze e casi d’uso di `localStorage` e `sessionStorage` e buone pratiche di persistenza.
- Progettare UI responsive con una libreria di componenti (Material UI *o* Ant Design).
- Implementare chiamate REST (GET/POST/PUT/PATCH/DELETE), gestione errori, loading, retry e cancellazione.
- Strutturare correttamente il codice (folder structure, separazione di responsabilità, naming, linting).

---

## 2) Deliverable attesi (Checklist)
- [ ] Repo Git con README e istruzioni di avvio (dev/prod).
- [ ] App React creata con Vite o Create React App (preferito: **Vite**).
- [ ] Routing base (React Router): `/login`, `/chat`, `/history`, `/settings`.
- [ ] Store Redux Toolkit configurato; almeno **1 slice** (ui/app) + **1 slice** per chat/sessione.
- [ ] Integrazione API: client modulare con interceptor per auth/headers; esempi GET/POST.
- [ ] Implementazione **RTK Query** *oppure* `createAsyncThunk` per le chiamate.
- [ ] UI con **Material UI** *o* **Ant Design**; layout responsive; tema light/dark opzionale.
- [ ] Persistenza selettiva (es: tema e preferenze in `localStorage`, token **non** in localStorage).
- [ ] Gestione errori centralizzata + toasts/notifiche.
- [ ] Documento tecnico breve: decisioni, trade-off, TODO e limiti aperti.

---

## 3) Architettura di alto livello

```mermaid
flowchart LR
  UI[React + MUI/Ant] --> RTK[Redux Toolkit (Slices/RTK Query)]
  RTK --> API[API Client (fetch/axios)]
  API --> BE[Backend App/API Gateway]
  BE --> IA[MadGem Service]
  subgraph Browser
    UI
    STG[(localStorage)]
    SST[(sessionStorage)]
  end
  UI <--> STG
  UI <--> SST
```

**Principi chiave**
- **Unidirezionalità dei dati**: UI → Actions → Reducers → Store → UI.
- **Separazione di responsabilità**: componenti “presentational” vs “container”/“smart”.
- **Single Source of Truth**: stato condiviso nello store; stato locale solo dove serve.
- **Side effects** nelle thunk/RTK Query, non dentro i componenti.

---

## 4) Setup del progetto

### 4.1 Prerequisiti
- Node LTS (≥ 18), pnpm o npm, Git.
- Estensioni consigliate: ESLint, Prettier, EditorConfig.

### 4.2 Creazione progetto (Vite)
```bash
# con pnpm (consigliato)
pnpm create vite@latest ai-platform --template react
cd ai-platform
pnpm i
pnpm i @reduxjs/toolkit react-redux axios react-router-dom
# UI a scelta (scegline una):
pnpm i @mui/material @emotion/react @emotion/styled @mui/icons-material
# oppure
pnpm i antd @ant-design/icons
pnpm i zod
pnpm i eslint prettier -D
```

### 4.3 Struttura cartelle (proposta)
```
src/
  app/
    store.ts
  components/
    common/
    layout/
  features/
    chat/
      ChatPage.tsx
      chatSlice.ts
      api.ts        # RTK Query endpoints o thunks
    auth/
      LoginPage.tsx
      authSlice.ts
  hooks/
  lib/
    api/
      client.ts     # axios/fetch wrapper
      interceptors.ts
    storage/
      local.ts
      session.ts
  pages/
  routes/
    index.tsx       # React Router
  styles/
  types/
  utils/
```

---

## 5) Persistenza: `localStorage` vs `sessionStorage`

### 5.1 Differenze principali
- **Durata**:  
  - `localStorage`: persiste oltre la chiusura del browser.  
  - `sessionStorage`: dura finché la *tab* è aperta.
- **Scopo**: entrambi sono *per-origin* (stesso schema+host+porta).
- **Capacità**: simile (circa 5–10MB), non adatto a dati voluminosi.
- **Sicurezza**: accessibile da JS → **non** salvare token sensibili. Preferire cookie **HTTPOnly** lato server.

### 5.2 Casi d’uso consigliati
- `localStorage`: preferenze utente (tema, lingua), flag onboarding, layout.
- `sessionStorage`: stato transitorio di sessione, passi del wizard, id conversazione attiva.
- **Mai**: access token/refresh token → usare cookie sicuri o in-memoria + rotate server-side.

### 5.3 Helper (esempio)
```ts
// src/lib/storage/local.ts
export const local = {
  get: <T>(k: string): T | null => {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) as T : null; }
    catch { return null; }
  },
  set: (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v)),
  del: (k: string) => localStorage.removeItem(k),
};
```

---

## 6) Chiamate API REST

### 6.1 Scelte tecniche
- Wrapper `axios` *o* `fetch` nativo con:
  - Base URL, timeout, header comuni (es. `Content-Type`, `Accept`).
  - Interceptor richiesta: aggiunta `X-Client`/`Authorization` **se** gestita lato cookie non è sufficiente.
  - Interceptor risposta: gestione 401/403, retry limitato con backoff, mapping errori.
- Validazione payload con **Zod** (o similari) all’ingresso/uscita.

### 6.2 Verbi e quando usarli
- **GET**: lettura risorse (idempotente, cacheabile).
- **POST**: creazione o operazioni non idempotenti (es. `/chat/ask`).
- **PUT**: sostituzione completa risorsa.
- **PATCH**: aggiornamento parziale.
- **DELETE**: rimozione risorsa.

### 6.3 Esempio client (axios)
```ts
// src/lib/api/client.ts
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: { "Accept": "application/json" }
});
```

```ts
// src/lib/api/interceptors.ts
import { api } from "./client";

api.interceptors.request.use(cfg => {
  // opzionale: cfg.headers.Authorization = `Bearer ${tokenInMemory}`;
  return cfg;
});
api.interceptors.response.use(
  r => r,
  err => {
    // mapping errori + rethrow
    const status = err?.response?.status;
    if (status === 401) { /* dispatch logout/refresh */ }
    return Promise.reject(err);
  }
);
```

### 6.4 Esempio fetch GET/POST
```ts
// GET
const res = await fetch(`${base}/history`, { credentials: "include" });
if (!res.ok) throw new Error("Fetch error");
const data = await res.json();

// POST
const res2 = await fetch(`${base}/chat/ask`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ message: "Ciao MadGem!" })
});
```

### 6.5 Streaming delle risposte (eventi / chunk)
- Preferire **Fetch Streaming** o **EventSource (SSE)** per risposte token-by-token.
- Gestire abort via `AbortController`.

```ts
const ctrl = new AbortController();
const res = await fetch(`${base}/chat/stream`, { method: "POST", body, signal: ctrl.signal });
const reader = res.body?.getReader();
let acc = "";
while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  acc += new TextDecoder().decode(value);
  // dispatch update parziale nello store
}
```

---

## 7) Integrazione con *MadGem* (placeholder tecnico)

> **Nota:** i dettagli esatti (endpoints, auth, parametri) dipendono dalla documentazione ufficiale *MadGem*. Qui si definisce il **contratto** lato FE.

### 7.1 Contratto minimo lato FE
- **Endpoint chat:** `POST /chat/ask` → `{ message: string, sessionId?: string, options?: {...} }`
- **Streaming:** `POST /chat/stream` (SSE o fetch streaming)
- **History:** `GET /chat/history?sessionId=...`
- **Sessioni:** `POST /chat/session` (crea), `PATCH /chat/session/:id` (rinomina), `DELETE /chat/session/:id`
- **Moderation (se presente):** `POST /moderate`

### 7.2 Tipi TS (indicativi)
```ts
export type ChatMessage = { id: string; role: "user"|"assistant"|"system"; content: string; createdAt: string };
export type ChatRequest = { message: string; sessionId?: string; options?: Record<string, unknown> };
export type ChatResponse = { message: ChatMessage; usage?: { promptTokens: number; completionTokens: number } };
```

---

## 8) Stato centralizzato con Redux Toolkit

### 8.1 Setup Store
```ts
// src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "../features/chat/chatSlice";

export const store = configureStore({
  reducer: { chat: chatReducer },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 8.2 Slice di esempio
```ts
// src/features/chat/chatSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../lib/api/client";

export const sendMessage = createAsyncThunk("chat/sendMessage", async (payload: { message: string; sessionId?: string }) => {
  const { data } = await api.post("/chat/ask", payload);
  return data;
});

type ChatState = {
  sessionId?: string;
  messages: Array<{ id: string; role: "user"|"assistant"; content: string }>;
  loading: boolean;
  error?: string;
};
const initialState: ChatState = { messages: [], loading: false };

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSessionId: (s, a: PayloadAction<string|undefined>) => { s.sessionId = a.payload; },
    appendLocalMessage: (s, a: PayloadAction<{ role: "user"|"assistant"; content: string }>) => {
      s.messages.push({ id: crypto.randomUUID(), ...a.payload });
    }
  },
  extraReducers: b => {
    b.addCase(sendMessage.pending, s => { s.loading = true; s.error = undefined; })
     .addCase(sendMessage.fulfilled, (s, a) => {
        s.loading = false;
        s.messages.push(a.payload.message);
     })
     .addCase(sendMessage.rejected, (s, a) => {
        s.loading = false; s.error = a.error.message;
     });
  }
});
export const { setSessionId, appendLocalMessage } = chatSlice.actions;
export default chatSlice.reducer;
```

### 8.3 RTK Query (alternativa)
- Definire `createApi` con baseQuery (fetchBaseQuery o axios base).
- Endpoints: `chatAsk`, `chatStream` (mutation), `getHistory` (query).
- Vantaggi: caching, invalidation, dedupe, hooks auto-generati.

---

## 9) UI e Layout: Material UI **o** Ant Design

### 9.1 Scelta libreria
- **Material UI (MUI)**: design Google, theming potente, enorme ecosistema.
- **Ant Design**: componenti enterprise pronti, ottimo Grid/Layout, form robusti.

### 9.2 Linee guida UI
- **Layout base** con Header (switch tema, user menu), Sidebar (sessioni), Content (chat), Footer (token/usage).
- **Responsive**: breakpoint XS/SM/MD/LG/XL; nascondere sidebar su mobile, drawer on demand.
- **Accessibilità**: semantica, aria-attrs, focus visible.
- **Feedback**: skeleton per loading, Empty states, error boundary.

### 9.3 Esempio layout (MUI)
```tsx
import { AppBar, Toolbar, Container, Box } from "@mui/material";

export function AppLayout({ children }) {
  return (
    <Box display="flex" minHeight="100vh" flexDirection="column">
      <AppBar position="sticky"><Toolbar>AI Platform</Toolbar></AppBar>
      <Container maxWidth="lg" sx={{ mt: 2, mb: 4, flex: 1 }}>{children}</Container>
      <Box component="footer" sx={{ p: 2, textAlign: "center" }}>© {new Date().getFullYear()}</Box>
    </Box>
  );
}
```

---

## 10) Routing e Pagine
- `/login`: form auth (placeholder).
- `/chat`: editor messaggio, area conversazione, pulsanti “Nuova chat”, “Salva sessione”.
- `/history`: lista conversazioni con ricerca/filtri.
- `/settings`: preferenze UI, modello, temperature, prompt system, clear cache.

**Esempio Router**
```tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
const router = createBrowserRouter([
  { path: "/", element: <ChatPage/> },
  { path: "/login", element: <LoginPage/> },
  { path: "/history", element: <HistoryPage/> },
  { path: "/settings", element: <SettingsPage/> },
]);
export function AppRouter() { return <RouterProvider router={router} />; }
```

---

## 11) Sicurezza & Privacy (base FE)
- **Token**: evitare localStorage; usare cookie httpOnly + SameSite + Secure impostati dal backend.
- **CORS**: solo origin attesi; header minimi; no wildcard in produzione.
- **Input sanitization**: escape markdown/HTML in messaggi renderizzati.
- **Rate limit lato BE**, debounce/throttle lato FE.
- **Error handling**: non esporre stack trace o dettagli interni.

---

## 12) Qualità del codice
- ESLint + Prettier + EditorConfig.
- Commit piccoli e descrittivi; PR con descrizione, test manuali, screenshot.
- Nomi chiari, componenti piccoli, evitare prop drilling superfluo.

---

## 13) Esercizi pratici (step by step)

1. **Storage helpers**
   - Implementa `local.ts` e `session.ts` con test manuali.
2. **API Client**
   - Crea `client.ts` con baseURL da `.env` e interceptor di base.
3. **Chat MVP**
   - Pagina `/chat` con input, invio messaggio (POST `/chat/ask`), visualizzazione risposta.
4. **Streaming**
   - Implementa stream incrementale e append del testo durante la ricezione.
5. **Redux Toolkit**
   - Sposta logica e stato in slice; mostra loading/error e toasts.
6. **UI Responsive**
   - Layout MUI/Ant con sidebar sessioni, collapse su mobile.
7. **History**
   - Lista delle conversazioni, ricerca per keyword, selezione sessione.
8. **Settings**
   - Preferenze salvate in `localStorage` (tema, lingua), reset impostazioni.

---

## 14) Acceptance Criteria (MVP)
- Invio messaggio e ricezione risposta da *MadGem* (anche mock se BE non pronto).
- UI responsive (mobile-first), nessun overflow orizzontale.
- Stato centralizzato: la conversazione non si perde cambiando pagina.
- Errori utente comprensibili; retry disponibile su fallimento.
- README con istruzioni chiare (env, avvio, build).

---

## 15) Variabili d’ambiente (esempio `.env`)
```
VITE_API_BASE_URL=https://api.example.com
VITE_APP_NAME=AI Platform
```

---

## 16) Risorse utili
- React: https://react.dev/learn
- Redux Toolkit: https://redux-toolkit.js.org/
- RTK Query: https://redux-toolkit.js.org/rtk-query/overview
- Material UI: https://mui.com/
- Ant Design: https://ant.design/
