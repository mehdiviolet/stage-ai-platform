import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { removeNotification } from "../features/ui/uiSlice";
import { Alert, Snackbar } from "@mui/material";

export function NotificationSnackbar() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((s) => s.ui.notifications);

  const currentNotification = notifications[0];

  // Auto-dismiss backup (se MUI fallisce)
  useEffect(() => {
    if (currentNotification) {
      const timer = setTimeout(() => {
        dispatch(removeNotification(currentNotification.id));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentNotification, dispatch]);

  // Gestione chiusura
  const handleClose = () => {
    if (currentNotification) {
      dispatch(removeNotification(currentNotification.id));
    }
  };

  return (
    <Snackbar
      open={!!currentNotification}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert
        onClose={handleClose}
        severity={currentNotification?.type}
        variant="filled"
      >
        {currentNotification?.message}
      </Alert>
    </Snackbar>
  );
}
