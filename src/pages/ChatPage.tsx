import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  Paper,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  appendLocalMessage,
  resetChat,
  sendMessage,
  setSessionId,
} from "../features/chat/chatSlice";
import { addNotification } from "../features/ui/uiSlice";
import { useEffect, useRef, useState } from "react";
import { local } from "../lib/storage/local";

type SavedSession = {
  id: string;
  title: string;
  messages: Array<{ id: string; role: "user" | "assistant"; content: string }>;
  createdAt: string;
  updatedAt: string;
};

function ChatPage() {
  const dispatch = useAppDispatch();
  const { messages, loading, error, sessionId } = useAppSelector((s) => s.chat);
  const [message, setMessage] = useState("");

  const canSend = message.trim().length > 0 && !loading;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🆕 Inizializza sessionId se non esiste (per la prima chat)
  useEffect(() => {
    if (!sessionId) {
      dispatch(setSessionId(crypto.randomUUID()));
    }
  }, [sessionId, dispatch]);

  const handleSend = async () => {
    if (!message.trim() || loading) return;
    setMessage("");
    dispatch(
      appendLocalMessage({
        role: "user",
        content: message,
      })
    );

    await dispatch(sendMessage({ message }));
  };

  const handleKeyDown = function (e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    dispatch(resetChat());
    dispatch(
      addNotification({
        message: "Nuova chat iniziata!",
        type: "info",
      })
    );
  };

  const generateTitle = (): string => {
    const firstUserMsg = messages.find((m) => m.role === "user");
    if (!firstUserMsg) return "Conversazione senza titolo!";
    const title = firstUserMsg.content.slice(0, 30);
    return title.length < firstUserMsg.content.length ? `${title}...` : title;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🆕 Salvataggio automatico della chat ad ogni modifica
  useEffect(() => {
    if (messages.length === 0 || !sessionId) return; // Non salvare chat vuote o senza ID

    // Recupera tutte le sessioni salvate
    const saved = local.get<SavedSession[]>("chatHistory") || [];

    // Trova se esiste già questa sessione
    const existingIndex = saved.findIndex((s) => s.id === sessionId);
    const existingSession = existingIndex >= 0 ? saved[existingIndex] : null;

    const session: SavedSession = {
      id: sessionId,
      title: generateTitle(),
      messages,
      createdAt: existingSession?.createdAt || new Date().toISOString(), // Mantieni data originale
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      // Aggiorna sessione esistente
      saved[existingIndex] = session;
    } else {
      // Aggiungi nuova sessione
      saved.push(session);
    }

    local.set("chatHistory", saved);

    // Notifica altre tab/componenti dell'aggiornamento
    window.dispatchEvent(new Event("chatHistoryUpdated"));
  }, [messages, sessionId]);

  const handleSaveSession = () => {
    if (messages.length === 0) {
      dispatch(
        addNotification({
          message: "Nessun messagio da salvare",
          type: "warning",
        })
      );
      return;
    }

    const session: SavedSession = {
      id: sessionId || crypto.randomUUID(),
      title: generateTitle(),
      messages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = local.get<SavedSession[]>("chatHistory") || [];
    saved.push(session);
    local.set("chatHistory", saved);
    dispatch(
      addNotification({
        message: "Conversazione salvata!",
        type: "success",
      })
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 200px)",
      }}
    >
      {/* âœ… Header con azioni */}
      {/* <AppBar position="static" color="default" elevation={1} sx={{ mb: 2 }}>
        <Toolbar variant="dense">
          <Typography variant="h6" sx={{ flex: 1 }}>
            Chat
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={handleNewChat}
            sx={{ mr: 1 }}
          >
            Nuova chat
          </Button>
          <Button
            startIcon={<SaveIcon />}
            onClick={handleSaveSession}
            disabled={messages.length === 0}
          >
            Salva sessione
          </Button>
        </Toolbar>
      </AppBar> */}

      {/* Area messaggi scrollabile */}
      <Paper
        elevation={1}
        sx={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          p: 2,
          mb: 2,
          bgcolor: "background.default",
        }}
      >
        {/* Empty state */}
        {messages.length === 0 && (
          <Box sx={{ textAlign: "center", mt: 4, color: "text.secondary" }}>
            <SmartToyIcon sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6">Nessun messaggio ancora</Typography>
            <Typography variant="body2">Inizia una conversazione!</Typography>
          </Box>
        )}

        {/* Messaggi */}
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: "flex",
              gap: 1,
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "70%",
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
            }}
          >
            <Avatar
              sx={{
                bgcolor: msg.role === "user" ? "primary.main" : "grey.400",
                width: 32,
                height: 32,
              }}
            >
              {msg.role === "user" ? (
                <PersonIcon fontSize="small" />
              ) : (
                <SmartToyIcon fontSize="small" />
              )}
            </Avatar>

            <Paper
              elevation={2}
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: msg.role === "user" ? "primary.main" : "grey.100",
                color: msg.role === "user" ? "white" : "text.primary",
              }}
            >
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {msg.content}
              </Typography>
            </Paper>
          </Box>
        ))}

        {/* Loading indicator */}
        {loading && (
          <Box sx={{ display: "flex", gap: 1, alignSelf: "flex-start" }}>
            <Avatar sx={{ bgcolor: "grey.400", width: 32, height: 32 }}>
              <SmartToyIcon fontSize="small" />
            </Avatar>
            <Paper elevation={2} sx={{ p: 1.5, bgcolor: "grey.100" }}>
              <Typography variant="body2" color="text.secondary">
                Sto scrivendo...
              </Typography>
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Paper>

      {/* Input area */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Scrivi un messaggio..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={!canSend}
          size="large"
        >
          <SendIcon />
        </IconButton>
      </Box>

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}

export default ChatPage;
