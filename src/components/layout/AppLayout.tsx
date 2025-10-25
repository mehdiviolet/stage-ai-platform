import { useState } from "react";
import {
  Box,
  Container,
  Drawer,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Outlet } from "react-router-dom";
import { NotificationSnackbar } from "../NotificationSnackbar";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // <960px

  // Stato per apertura drawer mobile
  const [mobileOpen, setMobileOpen] = useState(false);

  // Larghezza sidebar/drawer
  const drawerWidth = 280;

  // Toggle drawer mobile
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* ========================================
          DRAWER PERMANENTE (Desktop ≥960px)
      ======================================== */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" }, // Nascosto su mobile
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Sidebar onItemClick={() => {}} />
      </Drawer>

      {/* ========================================
          DRAWER TEMPORANEO (Mobile <960px)
      ======================================== */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Performance su mobile
        }}
        sx={{
          display: { xs: "block", md: "none" }, // Visibile solo su mobile
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Sidebar onItemClick={handleDrawerToggle} />
      </Drawer>

      {/* ========================================
          CONTENUTO PRINCIPALE
      ======================================== */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {/* Header Mobile (solo hamburger) */}
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            alignItems: "center",
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2 }}>
            AI Platform
          </Typography>
        </Box>

        {/* Contenuto pagine */}
        <Box
          sx={{
            flex: 1,
            maxWidth: "1200px",
            width: "100%",
            mx: "auto",
            px: 3,
            py: 2,
            overflow: "auto",
          }}
        >
          <Outlet />
        </Box>

        {/* Notifiche Toast */}
        <NotificationSnackbar />
      </Box>
    </Box>
  );
}
