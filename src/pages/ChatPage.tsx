import { Button } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { appendLocalMessage, sendMessage } from "../features/chat/chatSlice";
import { addNotification } from "../features/ui/uiSlice";

function ChatPage() {
  const dispatch = useAppDispatch();
  const { messages, loading, error } = useAppSelector((s) => s.chat);

  const handleSend = async () => {
    dispatch(
      appendLocalMessage({
        role: "user",
        content: "Ciao!",
      })
    );

    await dispatch(sendMessage({ message: "Ciao!" }));
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
      <button onClick={handleSend}>Invia</button>
      <Button
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
      </Button>
    </div>
  );
}

export default ChatPage;
