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
  createConversation,
  resetChat,
  sendMessage,
} from "../features/chat/chatSlice";
import { addNotification } from "../features/ui/uiSlice";
import { useEffect, useRef, useState } from "react";

function ChatPage() {
  const dispatch = useAppDispatch();
  const { currentConversation, loading, error } = useAppSelector((s) => s.chat);
  const [message, setMessage] = useState("");

  const canSend = message.trim().length > 0 && !loading;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Crea conversazione all'avvio se non esiste
    if (!currentConversation) {
      dispatch(
        createConversation({
          name: "Nuova Chat",
          model: "puyangwang/medgemma-27b-it:q6",
        })
      );
    }
  }, []);

  const handleSend = async () => {
    if (!message.trim() || loading || !currentConversation) return;

    const userMessage = message;
    setMessage("");

    dispatch(appendLocalMessage({ role: "user", content: userMessage }));

    await dispatch(
      sendMessage({
        conversationId: currentConversation.id,
        message: userMessage,
      })
    );
  };

  const handleKeyDown = function (e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation?.messages]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 200px)",
      }}
    >
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
        {currentConversation?.messages.length === 0 && (
          <Box sx={{ textAlign: "center", mt: 4, color: "text.secondary" }}>
            <SmartToyIcon sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6">Nessun messaggio ancora</Typography>
            <Typography variant="body2">Inizia una conversazione!</Typography>
          </Box>
        )}

        {/* Messaggi */}
        {currentConversation?.messages.map((msg) => (
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
                bgcolor:
                  msg.role === "user" ? "primary.main" : "background.paper",
                color:
                  msg.role === "user" ? "primary.contrastText" : "text.primary",
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
