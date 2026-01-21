import { useState, useEffect } from "react";
import { queueAPI } from "../services/api.js";
import { getSocket, joinQueue, leaveQueue } from "../services/socketService.js";

export default function AdminPanel() {
  const [selectedEstablishment, setSelectedEstablishment] = useState("");
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState({
    totalWaiting: 0,
    totalServed: 0,
    averageTime: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const establishments = [
    { id: "banco-central", name: "Banco Central" },
    { id: "farmacia-abc", name: "Farmácia ABC" },
    { id: "cartorio-xyz", name: "Cartório XYZ" },
  ];

  // Função para buscar dados da fila
  const fetchQueueData = async () => {
    if (!selectedEstablishment) {
      setQueue([]);
      setStats({ totalWaiting: 0, totalServed: 0, averageTime: 0 });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await queueAPI.getAllEntries(selectedEstablishment);
      setQueue(response.data.entries || []);
      setStats(response.data.stats || { totalWaiting: 0, totalServed: 0, averageTime: 0 });
    } catch (err) {
      setError(err.message || "Erro ao carregar fila");
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  // Configurar WebSocket quando estabelecimento mudar
  useEffect(() => {
    if (!selectedEstablishment) {
      setQueue([]);
      setStats({ totalWaiting: 0, totalServed: 0, averageTime: 0 });
      return;
    }

    // Buscar dados iniciais
    fetchQueueData();

    // Conectar ao WebSocket
    const socket = getSocket();
    joinQueue(selectedEstablishment);

    // Handlers para eventos WebSocket
    const handleQueueUpdate = (data) => {
      // Atualizar fila e estatísticas quando houver mudanças
      if (data.queue !== undefined || data.stats) {
        // Buscar todas as entradas para atualizar a lista completa
        fetchQueueData();
      }
    };

    const handleQueueCalled = (data) => {
      // Atualizar quando alguém for chamado
      fetchQueueData();
    };

    const handleQueueServed = (data) => {
      // Atualizar quando um atendimento for finalizado
      fetchQueueData();
    };

    // Escutar atualizações em tempo real
    socket.on('queue:update', handleQueueUpdate);
    socket.on('queue:called', handleQueueCalled);
    socket.on('queue:served', handleQueueServed);

    // Limpar ao desmontar ou mudar estabelecimento
    return () => {
      socket.off('queue:update', handleQueueUpdate);
      socket.off('queue:called', handleQueueCalled);
      socket.off('queue:served', handleQueueServed);
      leaveQueue(selectedEstablishment);
    };
  }, [selectedEstablishment]);

  // Chamar próximo da fila
  const handleCallNext = async () => {
    if (!selectedEstablishment) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await queueAPI.callNext(selectedEstablishment);
      setSuccess(response.message || "Cliente chamado com sucesso!");
      // WebSocket vai atualizar automaticamente, mas buscamos para garantir
      setTimeout(fetchQueueData, 300);
    } catch (err) {
      setError(err.message || "Erro ao chamar próximo");
    } finally {
      setLoading(false);
    }
  };

  // Finalizar atendimento
  const handleServeEntry = async (entryId) => {
    if (!selectedEstablishment) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await queueAPI.serveEntry(selectedEstablishment, entryId);
      setSuccess("Atendimento finalizado!");
      // WebSocket vai atualizar automaticamente, mas buscamos para garantir
      setTimeout(fetchQueueData, 300);
    } catch (err) {
      setError(err.message || "Erro ao finalizar atendimento");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar apenas os que estão esperando
  const waitingQueue = queue.filter(entry => entry.status === "waiting");
  const calledEntries = queue.filter(entry => entry.status === "called");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Painel de Administrador
        </h1>

        {/* Seleção de Estabelecimento */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Selecione o Estabelecimento
          </label>
          <select
            value={selectedEstablishment}
            onChange={(e) => setSelectedEstablishment(e.target.value)}
            className="w-full md:w-64 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="">-- Selecione --</option>
            {establishments.map((est) => (
              <option key={est.id} value={est.id}>
                {est.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mensagens de feedback */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {!selectedEstablishment && (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            Selecione um estabelecimento para ver a fila
          </div>
        )}

        {selectedEstablishment && (
          <>
            {/* Cards de Estatísticas */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">
                  Pessoas na Fila
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {loading ? "..." : stats.totalWaiting}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">
                  Atendidos Hoje
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {loading ? "..." : stats.totalServed}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">
                  Tempo Médio
                </h3>
                <p className="text-3xl font-bold text-orange-600">
                  {loading ? "..." : `${stats.averageTime} min`}
                </p>
              </div>
            </div>

            {/* Botão Chamar Próximo */}
            {waitingQueue.length > 0 && (
              <div className="mb-6">
                <button
                  onClick={handleCallNext}
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Carregando..." : "Chamar Próximo da Fila"}
                </button>
              </div>
            )}

            {/* Entradas Chamadas */}
            {calledEntries.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Chamados (Aguardando Atendimento)
                </h2>
                <div className="space-y-2">
                  {calledEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-white p-4 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold">{entry.name}</p>
                        <p className="text-sm text-gray-600">{entry.phone}</p>
                      </div>
                      <button
                        onClick={() => handleServeEntry(entry.id)}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        Finalizar Atendimento
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fila de Espera */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Fila Atual ({waitingQueue.length} {waitingQueue.length === 1 ? "pessoa" : "pessoas"})
                </h2>
                <span className="text-xs text-green-600 font-semibold flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Tempo Real
                </span>
              </div>

              {loading && waitingQueue.length === 0 && (
                <p className="text-center text-gray-500 py-8">Carregando...</p>
              )}

              {!loading && waitingQueue.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma pessoa na fila no momento
                </p>
              )}

              {waitingQueue.length > 0 && (
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Posição</th>
                      <th className="px-4 py-2 text-left">Nome</th>
                      <th className="px-4 py-2 text-left">Telefone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitingQueue.map((entry) => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{entry.position}</td>
                        <td className="px-4 py-3">{entry.name}</td>
                        <td className="px-4 py-3">{entry.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
