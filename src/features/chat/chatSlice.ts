import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { api } from "../../lib/api/client";

type ChatState = {
  sessionId?: string;
  messages: Array<{ id: string; role: "user" | "assistant"; content: string }>;
  loading: boolean;
  error?: string;
};

const initialState: ChatState = {
  messages: [],
  loading: false,
};

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (payload: { message: string; sessionId?: string }) => {
    const { data } = await api.post("/chat/ask", payload);
    return data;
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSessionId: (s, a: PayloadAction<string | undefined>) => {
      s.sessionId = a.payload;
    },
    appendLocalMessage: (
      s,
      a: PayloadAction<{ role: "user" | "assistant"; content: string }>
    ) => {
      s.messages.push({ id: crypto.randomUUID(), ...a.payload });
    },
    resetChat: (s) => {
      s.messages = [];
      s.loading = false;
    },
  },
  extraReducers: (b) => {
    b.addCase(sendMessage.pending, (s) => {
      s.loading = true;
      s.error = undefined;
    })
      .addCase(sendMessage.fulfilled, (s, a) => {
        s.loading = false;
        s.messages.push(a.payload.message);
      })
      .addCase(sendMessage.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message;
      });
  },
});
export const { setSessionId, appendLocalMessage, resetChat } =
  chatSlice.actions;
export default chatSlice.reducer;
