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
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  deleteConversation,
  loadConversationById,
  loadConversations,
} from "../features/chat/chatSlice";

function HistoryPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { conversations, loading } = useAppSelector((s) => s.chat);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(loadConversations());
  }, [dispatch]);

  const handleLoadSession = (conversationId: number) => {
    dispatch(loadConversationById(conversationId));
    navigate("/");
  };

  const handleDeleteSession = (conversationId: number) => {
    dispatch(deleteConversation(conversationId));
  };

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

  const filteredSessions = conversations.filter((conv) => {
    const query = searchQuery.toLowerCase();
    return conv.name.toLowerCase().includes(query);
  });

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
      {conversations.length === 0 && (
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
          {filteredSessions.map((conversation) => (
            <Card key={conversation.id} elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {conversation.name}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                  <Chip
                    label={`${conversation.messageCount} messaggi`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={formatDate(conversation.updated_at)}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={conversation.model}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <IconButton
                  color="primary"
                  onClick={() => handleLoadSession(conversation.id)}
                  title="Carica conversazione"
                >
                  <OpenInNewIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleDeleteSession(conversation.id)}
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
      {conversations.length > 0 && filteredSessions.length === 0 && (
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
