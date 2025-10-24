import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import { NotificationSnackbar } from "../NotificationSnackbar";

export function AppLayout() {
  const navigate = useNavigate();
  return (
    <Box display="flex" minHeight="100vh" flexDirection="column">
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" sx={{ mr: 2 }}>
            AI Platform
          </Typography>
          <Button color="inherit" onClick={() => navigate("/")}>
            Chat
          </Button>
          <Button color="inherit" onClick={() => navigate("/history")}>
            History
          </Button>
          <Button color="inherit" onClick={() => navigate("/settings")}>
            Settings
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 2, mb: 4, flex: 1 }}>
        <Outlet />
      </Container>
      <Box component="footer" sx={{ p: 2, textAlign: "center" }}>
        © {new Date().getFullYear()} AI Platform
      </Box>
      <NotificationSnackbar />
    </Box>
  );
}
