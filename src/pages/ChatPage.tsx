import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
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
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  appendLocalMessage,
  createConversation,
  resetChat,
  sendMessage,
} from "../features/chat/chatSlice";
import { addNotification } from "../features/ui/uiSlice";
import { useEffect, useRef, useState } from "react";
import { AttachFile } from "@mui/icons-material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { mediaApi } from "../features/chat/api";

// Helper: converte File in stringa base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result); // già in formato "data:image/png;base64,..."
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

type FileWithPreview = {
  file: File;
  preview: string; // URL temporaneo per anteprima
};

function ChatPage() {
  const dispatch = useAppDispatch();
  const { currentConversation, loading, error } = useAppSelector((s) => s.chat);
  const [message, setMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<FileWithPreview[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apre il dialogo di selezione file
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  // Gestisce i file selezionati

  // const canSend = message.trim().length > 0 && !loading;
  const canSend =
    (message.trim().length > 0 || attachedFiles.length > 0) && !loading;
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
    if (
      (!message.trim() && attachedFiles.length === 0) ||
      loading ||
      !currentConversation
    )
      return;

    const userMessage = message;
    setMessage("");

    // 🆕 STEP 1: Carica file su S3 PRIMA di inviare il messaggio
    let uploadedUrls: string[] = [];

    if (attachedFiles.length > 0) {
      try {
        // Upload ogni file su S3
        for (const item of attachedFiles) {
          const base64 = await fileToBase64(item.file);

          // Chiamata a /media/upload
          const uploadResponse = await mediaApi.uploadFile({
            base64,
            fileName: item.file.name,
            mimeType: item.file.type,
          });

          // Salva l'URL S3 ritornato
          uploadedUrls.push(uploadResponse.data.url);
        }
      } catch (error) {
        console.error("❌ Errore upload media:", error);
        dispatch(
          addNotification({
            message: "Errore nel caricamento dei file",
            type: "error",
          })
        );
        return; // Interrompi se upload fallisce
      }
    }

    // 🆕 STEP 2: Aggiungi messaggio utente localmente CON gli URL S3
    dispatch(
      appendLocalMessage({
        role: "user",
        content: userMessage,
        mediaUrls: uploadedUrls.length > 0 ? uploadedUrls : undefined,
      })
    );

    // 🆕 STEP 3: Prepara media per Ollama (serve ancora base64 per analisi AI)
    const mediaArray = await Promise.all(
      attachedFiles.map(async (item) => {
        const base64 = await fileToBase64(item.file);
        return {
          base64,
          fileName: item.file.name,
          mimeType: item.file.type,
        };
      })
    );

    // STEP 4: Invia messaggio con media (per far analizzare l'immagine all'AI)
    await dispatch(
      sendMessage({
        conversationId: currentConversation.id,
        message: userMessage,
        media: mediaArray.length > 0 ? mediaArray : undefined,
      })
    );

    // STEP 5: Pulisci
    attachedFiles.forEach((item) => URL.revokeObjectURL(item.preview));
    setAttachedFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files).map((file) => ({
        file,
        preview: URL.createObjectURL(file), // 👈 Crea URL temporaneo
      }));
      setAttachedFiles((prev) => [...prev, ...newFiles]);
      e.target.value = "";
    }
  };

  // Rimuove un file dall'anteprima
  const handleRemoveFile = (index: number) => {
    setAttachedFiles((prev) => {
      const fileToRemove = prev[index];
      URL.revokeObjectURL(fileToRemove.preview); // 👈 Libera memoria
      return prev.filter((_, i) => i !== index);
    });
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
              {/* <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}> */}
              {msg.mediaUrls && msg.mediaUrls.length > 0 && (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                  {msg.mediaUrls.map((url, idx) => (
                    <Box
                      key={idx}
                      component="img"
                      src={url}
                      alt={`Media ${idx + 1}`}
                      sx={{
                        maxWidth: 200,
                        maxHeight: 200,
                        borderRadius: 1,
                        objectFit: "cover",
                        cursor: "pointer",
                        "&:hover": {
                          opacity: 0.8,
                        },
                      }}
                      onClick={() => window.open(url, "_blank")} // 🆕 Click per aprire full-size
                    />
                  ))}
                </Box>
              )}
              {/* {msg.content} */}
              {/* </Typography> */}
              {msg.content && (
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                  {msg.content}
                </Typography>
              )}
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

      {/* Anteprima file allegati */}
      {attachedFiles.length > 0 && (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          {attachedFiles.map((item, index) => (
            <Box
              key={index}
              sx={{
                position: "relative",
                width: 80,
                height: 80,
                borderRadius: 2,
                overflow: "hidden",
                border: "2px solid",
                borderColor: "primary.main",
              }}
            >
              {/* Thumbnail immagine */}
              <img
                src={item.preview}
                alt={item.file.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              {/* Pulsante X per rimuovere */}
              <IconButton
                size="small"
                onClick={() => handleRemoveFile(index)}
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  bgcolor: "rgba(0,0,0,0.6)",
                  color: "white",
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.8)",
                  },
                  width: 24,
                  height: 24,
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      {/* Input area */}
      <Box sx={{ display: "flex", gap: 1 }}>
        {/* Input file nascosto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <IconButton
          color="default"
          onClick={handleAttachClick}
          disabled={loading}
          size="large"
          title="Allega file"
        >
          <AttachFileIcon />
        </IconButton>
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
