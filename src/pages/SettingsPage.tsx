import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  resetSettings,
  setLanguage,
  toggleTheme,
} from "../features/ui/uiSlice"; // ← Fix: ui invece di chat
import { local } from "../lib/storage/local";

// Material UI
import {
  Container,
  Typography,
  Card,
  CardContent,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Divider,
} from "@mui/material";

export default function SettingsPage() {
  const theme = useAppSelector((state) => state.ui.theme);
  const language = useAppSelector((state) => state.ui.language);
  const dispatch = useAppDispatch();

  const handleThemeChange = () => {
    dispatch(toggleTheme());
  };

  const handleLanguageChange = (newLang: "it" | "en") => {
    dispatch(setLanguage(newLang));
  };

  const handleReset = () => {
    dispatch(resetSettings());
  };

  // Persistenza automatica in localStorage
  useEffect(() => {
    local.set("theme", theme);
  }, [theme]);

  useEffect(() => {
    local.set("language", language);
  }, [language]);

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      {/* Titolo pagina */}
      <Typography variant="h4" gutterBottom>
        ⚙️ Impostazioni
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Personalizza l'aspetto e le preferenze dell'applicazione
      </Typography>

      {/* Card 1: Aspetto (Tema) */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🎨 Aspetto
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Tema
          </Typography>
          <ToggleButtonGroup
            value={theme}
            exclusive
            onChange={handleThemeChange}
            fullWidth
            color="primary"
          >
            <ToggleButton value="light">☀️ Light</ToggleButton>
            <ToggleButton value="dark">🌙 Dark</ToggleButton>
          </ToggleButtonGroup>
        </CardContent>
      </Card>

      {/* Card 2: Lingua */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🌍 Lingua
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <FormControl fullWidth>
            <InputLabel id="language-select-label">Lingua</InputLabel>
            <Select
              labelId="language-select-label"
              value={language}
              label="Lingua"
              onChange={(e) =>
                handleLanguageChange(e.target.value as "it" | "en")
              }
            >
              <MenuItem value="it">🇮🇹 Italiano</MenuItem>
              <MenuItem value="en">🇬🇧 English</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Card 3: Reset */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🔄 Ripristina Impostazioni
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ripristina tutte le preferenze ai valori predefiniti (tema Light,
            lingua Italiano)
          </Typography>
          <Button
            variant="outlined"
            color="warning"
            fullWidth
            onClick={handleReset}
          >
            Ripristina Impostazioni Predefinite
          </Button>
        </CardContent>
      </Card>

      {/* Info footer */}
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">
          Le preferenze vengono salvate automaticamente nel tuo browser
        </Typography>
      </Box>
    </Container>
  );
}
