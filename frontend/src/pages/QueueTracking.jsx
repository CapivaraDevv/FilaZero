import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSocket, joinQueue, leaveQueue } from "../services/socketService.js";

export default function QueueTracking() {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const [queueEntry, setQueueEntry] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [isCalled, setIsCalled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  // Buscar dados da entrada
  useEffect(() => {
    const fetchEntry = async () => {
      if (!entryId) {
        setError("ID da entrada não fornecido");
        setLoading(false);
        return;
      }

      try {
        const storedEntry = localStorage.getItem(`queue_entry_${entryId}`);
        if (storedEntry) {
          const entry = JSON.parse(storedEntry);
          setQueueEntry(entry);
          setCurrentPosition(entry.position);
          setIsCalled(entry.status === "called");
          setLoading(false);
          return;
        }

        setError("Entrada não encontrada. Por favor, entre na fila novamente.");
        setLoading(false);
      } catch {
        setError("Erro ao carregar dados da fila");
        setLoading(false);
      }
    };

    fetchEntry();
  }, [entryId]);

  // WebSocket
  useEffect(() => {
    if (!queueEntry?.establishmentId) return;

    const socket = getSocket();
    socketRef.current = socket;

    const setupSocket = () => {
      joinQueue(queueEntry.establishmentId);
    };

    socket.connected
      ? setupSocket()
      : socket.once("connect", setupSocket);

    const handleQueueUpdate = (data) => {
      if (data.newEntry?.id === queueEntry.id) {
        const updated = { ...queueEntry, ...data.newEntry };
        localStorage.setItem(
          `queue_entry_${queueEntry.id}`,
          JSON.stringify(updated)
        );
        setQueueEntry(updated);
        if (data.newEntry.status === "called") {
          setIsCalled(true);
        }
      }

      const updatedEntry = data.queue?.find(
        (entry) => entry.id === queueEntry.id
      );

      if (updatedEntry) {
        const updated = { ...queueEntry, position: updatedEntry.position };
        setCurrentPosition(updatedEntry.position);
        setQueueEntry(updated);
        localStorage.setItem(
          `queue_entry_${queueEntry.id}`,
          JSON.stringify(updated)
        );
      }
    };

    const handleQueueCalled = (data) => {
      const entryId = String(data.entry?.id || "").trim();
      const myId = String(queueEntry.id || "").trim();

      const isSamePerson =
        entryId === myId ||
        (data.entry?.name === queueEntry.name &&
          data.entry?.phone === queueEntry.phone &&
          data.establishmentId === queueEntry.establishmentId);

      if (!isSamePerson) return;

      setIsCalled(true);

      const updated = {
        ...queueEntry,
        status: "called",
        id: data.entry?.id || queueEntry.id,
      };

      setQueueEntry(updated);
      localStorage.setItem(
        `queue_entry_${updated.id}`,
        JSON.stringify(updated)
      );

      if ("Notification" in window && Notification.permission === "granted") {
        try {
          const notification = new Notification("🔔 Sua vez chegou!", {
            body: "Você foi chamado na fila. Dirija-se ao atendimento!",
            icon: "/favicon.ico",
            tag: "queue-called",
            requireInteraction: true,
          });

          notification.onclick = () => {
            window.focus();
            notification.close();
          };
        } catch (error) {
          console.error("Erro ao criar notificação:", error);
        }
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    socket.on("queue:update", handleQueueUpdate);
    socket.on("queue:called", handleQueueCalled);

    return () => {
      socket.off("queue:update", handleQueueUpdate);
      socket.off("queue:called", handleQueueCalled);
      leaveQueue(queueEntry.establishmentId);
    };
  }, [queueEntry]);

  // Permissão de notificação
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      setTimeout(() => {
        Notification.requestPermission();
      }, 1000);
    }
  }, []);

  // Fallback via localStorage
  useEffect(() => {
    if (!queueEntry) return;

    const interval = setInterval(() => {
      const stored = localStorage.getItem(`queue_entry_${queueEntry.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.status === "called" && !isCalled) {
          setIsCalled(true);
          setQueueEntry(parsed);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [queueEntry, isCalled]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !queueEntry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/fila")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div
          className={`rounded-2xl shadow-xl p-10 bg-white ${
            isCalled
              ? "bg-yellow-100 border-yellow-500"
              : "bg-white border-gray-200"
          }`}
        >
          {isCalled ? (
            <div className="text-center">
              <h1 className="sora-title text-5xl font-bold text-black mb-4">
                SUA VEZ CHEGOU!
              </h1>
              <p className="inter-text text-xl text-black">
                Dirija-se ao atendimento.
              </p>
              <h1 className="text-3xl font-bold mb-6">
                Acompanhamento da Fila
              </h1>
              <p className="text-6xl font-bold text-[#000000]">
                  {currentPosition}
                </p>
            </div>
          ) : (
            <>
              
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <h1 className="sora-title text-4xl">Aguarde até ser chamado</h1>
                <h2 className="inter-text text-2xl">Posição atual:</h2>
                <p className="">
                  {currentPosition}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
