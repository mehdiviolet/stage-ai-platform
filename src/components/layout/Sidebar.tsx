import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  IconButton,
  ListItemIcon,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import HomeIcon from "@mui/icons-material/Home";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import { useAppDispatch } from "../../app/hooks";
// import { loadSession, resetChat } from "../../features/chat/chatSlice";
import { resetChat } from "../../features/chat/chatSlice";
import { addNotification } from "../../features/ui/uiSlice";
import { local } from "../../lib/storage/local";

type SavedSession = {
  id: string;
  title: string;
  messages: Array<{ id: string; role: "user" | "assistant"; content: string }>;
  createdAt: string;
  updatedAt: string;
};

interface SidebarProps {
  onItemClick: () => void; // Callback per chiudere drawer mobile
}

export function Sidebar({ onItemClick }: SidebarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [sessions, setSessions] = useState<SavedSession[]>([]);

  // Carica sessioni da localStorage
  useEffect(() => {
    loadSessions();

    // Listener per aggiornamenti localStorage (da altre tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "chatHistory") {
        loadSessions();
      }
    };

    // Custom event per aggiornamenti nella stessa tab
    const handleCustomUpdate = () => {
      loadSessions();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("chatHistoryUpdated", handleCustomUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("chatHistoryUpdated", handleCustomUpdate);
    };
  }, []);

  const loadSessions = () => {
    const saved = local.get<SavedSession[]>("chatHistory") || [];
    // Ordina per data (più recente prima)
    const sorted = saved.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    setSessions(sorted);
  };

  // Nuova chat
  const handleNewChat = () => {
    dispatch(resetChat());
    dispatch(
      addNotification({
        message: "Nuova chat iniziata!",
        type: "info",
      })
    );
    navigate("/");
    onItemClick(); // Chiude drawer mobile
  };

  // Carica sessione esistente
  // const handleLoadSession = (session: SavedSession) => {
  //   dispatch(
  //     loadSession({
  //       id: session.id,
  //       message: session.messages,
  //     })
  //   );
  //   dispatch(
  //     addNotification({
  //       message: `Caricata: ${session.title}`,
  //       type: "success",
  //     })
  //   );
  //   navigate("/");
  //   onItemClick(); // Chiude drawer mobile
  // };

  // Elimina sessione
  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation(); // Previene click su ListItem
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

  // Formatta data relativa
  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m fa`;
    if (diffHours < 24) return `${diffHours}h fa`;
    if (diffDays < 7) return `${diffDays}g fa`;

    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      {/* ========== TOP: Bottone Nuova Chat ========== */}
      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<AddIcon />}
          onClick={handleNewChat}
          size="large"
        >
          Nuova Chat
        </Button>
      </Box>

      <Divider />

      {/* ========== CENTER: Header + Lista Conversazioni ========== */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ fontWeight: 600, fontSize: "0.75rem" }}
        >
          CONVERSAZIONI
        </Typography>
      </Box>

      {/* Lista Sessioni (scrollabile) */}
      <List sx={{ flex: 1, overflow: "auto", px: 1 }}>
        {sessions.length === 0 ? (
          // Empty state
          <Box sx={{ textAlign: "center", mt: 4, px: 2 }}>
            <ChatBubbleOutlineIcon
              sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              Nessuna conversazione salvata
            </Typography>
          </Box>
        ) : (
          // Lista sessioni
          sessions.map((session) => (
            <ListItem
              key={session.id}
              disablePadding
              secondaryAction={
                <IconButton
                  edge="end"
                  size="small"
                  onClick={(e) => handleDeleteSession(e, session.id)}
                  sx={{ color: "error.main" }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemButton
                onClick={() => handleLoadSession(session)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ChatBubbleOutlineIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                      {session.title}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {session.messages.length} msg ·{" "}
                      {formatDate(session.updatedAt)}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>

      <Divider />

      {/* ========== BOTTOM: Navigation Menu ========== */}
      <List sx={{ py: 1 }}>
        {/* Chat */}
        <ListItemButton
          selected={location.pathname === "/"}
          onClick={() => {
            navigate("/");
            onItemClick();
          }}
        >
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Chat" />
        </ListItemButton>

        {/* Storico */}
        <ListItemButton
          selected={location.pathname === "/history"}
          onClick={() => {
            navigate("/history");
            onItemClick();
          }}
        >
          <ListItemIcon>
            <HistoryIcon />
          </ListItemIcon>
          <ListItemText primary="Storico" />
        </ListItemButton>

        {/* Impostazioni */}
        <ListItemButton
          selected={location.pathname === "/settings"}
          onClick={() => {
            navigate("/settings");
            onItemClick();
          }}
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Impostazioni" />
        </ListItemButton>
      </List>
    </Box>
  );
}
