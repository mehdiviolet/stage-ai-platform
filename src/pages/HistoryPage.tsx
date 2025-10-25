import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  CardActions,
  IconButton,
  List,
  Chip,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import HistoryIcon from "@mui/icons-material/History";
import { useAppDispatch } from "../app/hooks";
import { loadSession } from "../features/chat/chatSlice";
import { addNotification } from "../features/ui/uiSlice";
import { local } from "../lib/storage/local";

type SavedSession = {
  id: string;
  title: string;
  messages: Array<{ id: string; role: "user" | "assistant"; content: string }>;
  createdAt: string;
  updatedAt: string;
};

function HistoryPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // âœ… Carica sessioni da localStorage
  useEffect(() => {
    const saved = local.get<SavedSession[]>("chatHistory") || [];
    // Ordina per data (piÃ¹ recente prima)
    const sorted = saved.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    setSessions(sorted);
  }, []);

  // âœ… Filtra sessioni per ricerca
  const filteredSessions = sessions.filter((session) => {
    const query = searchQuery.toLowerCase();
    // Cerca nel titolo
    if (session.title.toLowerCase().includes(query)) return true;
    // Cerca nel contenuto messaggi
    return session.messages.some((msg) =>
      msg.content.toLowerCase().includes(query)
    );
  });

  // âœ… Carica sessione in ChatPage
  const handleLoadSession = (session: SavedSession) => {
    dispatch(loadSession({ id: session.id, message: session.messages }));
    dispatch(
      addNotification({
        message: "Conversazione caricata!",
        type: "success",
      })
    );
    navigate("/"); // Redirect a ChatPage
  };

  // âœ… Elimina sessione
  const handleDeleteSession = (sessionId: string) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    local.set("chatHistory", updated);
    dispatch(
      addNotification({
        message: "Conversazione eliminata",
        type: "info",
      })
    );
  };

  // âœ… Formatta data
  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <HistoryIcon fontSize="large" color="primary" />
        <Typography variant="h4">Cronologia conversazioni</Typography>
      </Box>

      {/* Ricerca */}
      <TextField
        fullWidth
        placeholder="Cerca nelle conversazioni..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
      />

      {/* Empty state */}
      {sessions.length === 0 && (
        <Box sx={{ textAlign: "center", mt: 8, color: "text.secondary" }}>
          <HistoryIcon sx={{ fontSize: 80, mb: 2, opacity: 0.3 }} />
          <Typography variant="h6" gutterBottom>
            Nessuna conversazione salvata
          </Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Le tue conversazioni salvate appariranno qui
          </Typography>
          <Button variant="contained" onClick={() => navigate("/")}>
            Vai alla Chat
          </Button>
        </Box>
      )}

      {/* Lista sessioni */}
      {filteredSessions.length > 0 && (
        <List sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filteredSessions.map((session) => (
            <Card key={session.id} elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {session.title}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                  <Chip
                    label={`${session.messages.length} messaggi`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={formatDate(session.updatedAt)}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {session.messages[0]?.content.slice(0, 100)}
                  {session.messages[0]?.content.length > 100 ? "..." : ""}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <IconButton
                  color="primary"
                  onClick={() => handleLoadSession(session)}
                  title="Carica conversazione"
                >
                  <OpenInNewIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleDeleteSession(session.id)}
                  title="Elimina conversazione"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </List>
      )}

      {/* Nessun risultato ricerca */}
      {sessions.length > 0 && filteredSessions.length === 0 && (
        <Box sx={{ textAlign: "center", mt: 4, color: "text.secondary" }}>
          <Typography variant="h6">Nessun risultato</Typography>
          <Typography variant="body2">
            Nessuna conversazione corrisponde alla ricerca "{searchQuery}"
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default HistoryPage;
