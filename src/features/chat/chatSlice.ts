import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { conversationsApi } from "./api";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  mediaUrls?: string[];
};

type Conversation = {
  id: number;
  name: string;
  model: string;
  created_at: string;
  updated_at: string;
  messageCount: number;
};

type ChatState = {
  conversations: Conversation[];
  currentConversation: {
    id: number;
    name: string;
    model: string;
    messages: Message[];
  } | null;
  loading: boolean;
  error?: string;
};

const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  loading: false,
};

// AsyncThunks
export const createConversation = createAsyncThunk(
  "chat/createConversation",
  async (payload: { name: string; model: string }) => {
    const { data } = await conversationsApi.create(payload);
    return data;
  }
);

export const loadConversations = createAsyncThunk(
  "chat/loadConversations",
  async () => {
    const { data } = await conversationsApi.getAll();
    return data;
  }
);

export const loadConversationById = createAsyncThunk(
  "chat/loadConversationById",
  async (id: number) => {
    const { data } = await conversationsApi.getById(id);
    return data;
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (payload: {
    conversationId: number;
    message: string;
    media?: any[];
  }) => {
    const { data } = await conversationsApi.sendMessage(
      payload.conversationId,
      { message: payload.message, media: payload.media }
    );
    return data;
  }
);

export const deleteConversation = createAsyncThunk(
  "chat/deleteConversation",
  async (id: number) => {
    await conversationsApi.delete(id);
    return id;
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    resetChat: (s) => {
      s.currentConversation = null;
      s.loading = false;
      s.error = undefined;
    },
    appendLocalMessage: (
      s,
      a: PayloadAction<{
        role: "user" | "assistant";
        content: string;
        mediaUrls?: string[]; // 🆕 AGGIUNGI QUESTO
      }>
    ) => {
      if (s.currentConversation) {
        s.currentConversation.messages.push({
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...a.payload,
        });
      }
    },
  },
  extraReducers: (b) => {
    // CREATE CONVERSATION
    b.addCase(createConversation.pending, (s) => {
      s.loading = true;
      s.error = undefined;
    })
      .addCase(createConversation.fulfilled, (s, a) => {
        s.loading = false;
        s.conversations.unshift(a.payload.conversation);
        s.currentConversation = {
          ...a.payload.conversation,
          messages: [],
        };
      })
      .addCase(createConversation.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message;
      })

      // LOAD CONVERSATIONS
      .addCase(loadConversations.pending, (s) => {
        s.loading = true;
        s.error = undefined;
      })
      .addCase(loadConversations.fulfilled, (s, a) => {
        s.loading = false;
        s.conversations = a.payload.conversations;
      })
      .addCase(loadConversations.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message;
      })

      // LOAD CONVERSATION BY ID
      .addCase(loadConversationById.pending, (s) => {
        s.loading = true;
        s.error = undefined;
      })
      .addCase(loadConversationById.fulfilled, (s, a) => {
        s.loading = false;
        s.currentConversation = a.payload.conversation;
      })
      .addCase(loadConversationById.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message;
      })

      // SEND MESSAGE
      .addCase(sendMessage.pending, (s) => {
        s.loading = true;
        s.error = undefined;
      })
      .addCase(sendMessage.fulfilled, (s, a) => {
        s.loading = false;
        console.log("✅ Messaggio da salvare:", a.payload.message);
        if (s.currentConversation) {
          s.currentConversation.messages.push(a.payload.message);
        }
      })
      .addCase(sendMessage.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message;
      })

      // DELETE CONVERSATION
      .addCase(deleteConversation.fulfilled, (s, a) => {
        s.conversations = s.conversations.filter((c) => c.id !== a.payload);
        if (s.currentConversation?.id === a.payload) {
          s.currentConversation = null;
        }
      });
  },
});

export const { resetChat, appendLocalMessage } = chatSlice.actions;
export default chatSlice.reducer;
