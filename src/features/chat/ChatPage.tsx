import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { sendMessage } from "./chatSlice";

function ChatPage() {
  const dispatch = useAppDispatch();
  const { messages, loading, error } = useAppSelector((s) => s.chat);

  const handleSend = async () => {
    await dispatch(sendMessage({ message: "Ciao!" }));
  };

  return (
    <div>
      {loading && <p>Caricamento ...</p>}
      {error && <p>Errore: {error}</p>}
      <button onClick={handleSend}>Invia</button>
    </div>
  );
}
