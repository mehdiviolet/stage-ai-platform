import { Box, Button, IconButton, TextField } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import { appendLocalMessage, sendMessage } from "../features/chat/chatSlice";
import { addNotification } from "../features/ui/uiSlice";
import { useState } from "react";

function ChatPage() {
  const dispatch = useAppDispatch();
  const { messages, loading, error } = useAppSelector((s) => s.chat);
  const [message, setMessage] = useState("");

  const canSend = message.trim().length > 0 && !loading;

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

  return (
    <div>
      {loading && <p>Caricamento ...</p>}
      {error && <p>Errore: {error}</p>}
      {messages.length === 0 && <p>Nessun mesagio ancora.</p>}
      {messages.length !== 0 &&
        messages.map((msg) => (
          <div key={msg.id}>
            {msg.role} : {msg.content}
          </div>
        ))}
      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
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
        <IconButton color="primary" onClick={handleSend} disabled={!canSend}>
          <SendIcon />
        </IconButton>
      </Box>
      {/* <Button
        onClick={() =>
          dispatch(
            addNotification({
              message: "Test notifica successo!",
              type: "success",
            })
          )
        }
      >
        Test Success
      </Button>

      <Button
        onClick={() =>
          dispatch(
            addNotification({
              message: "Errore di test!",
              type: "error",
            })
          )
        }
      >
        Test Error
      </Button> */}
    </div>
  );
}

export default ChatPage;
