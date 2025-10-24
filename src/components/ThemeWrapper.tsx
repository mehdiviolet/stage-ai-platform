import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useAppSelector } from "../app/hooks";
import React, { useMemo } from "react";
import { CssBaseline } from "@mui/material";

type ThemeWrapperProps = {
  children: React.ReactNode;
};

export function ThemeWrapper({ children }: ThemeWrapperProps) {
  const theme = useAppSelector((s) => s.ui.theme);

  const muiTheme = useMemo(() => {
    return createTheme({
      palette: {
        mode: theme,
      },
    });
  }, [theme]);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
