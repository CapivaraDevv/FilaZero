import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { queueAPI } from "../services/api.js";
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
        setError('ID da entrada não fornecido');
        setLoading(false);
        return;
      }

      try {
        // Como não temos uma rota específica para buscar por ID, vamos tentar buscar pela fila
        // Por enquanto, vamos usar uma abordagem diferente - armazenar no localStorage
        const storedEntry = localStorage.getItem(`queue_entry_${entryId}`);
        if (storedEntry) {
          const entry = JSON.parse(storedEntry);
          setQueueEntry(entry);
          setCurrentPosition(entry.position);
          setIsCalled(entry.status === 'called');
          setLoading(false);
          return;
        }

        // Se não encontrar no localStorage, mostrar erro
        setError('Entrada não encontrada. Por favor, entre na fila novamente.');
        setLoading(false);
      } catch (err) {
        setError('Erro ao carregar dados da fila');
        setLoading(false);
      }
    };

    fetchEntry();
  }, [entryId]);

  // Configurar WebSocket quando tiver os dados da entrada
  useEffect(() => {
    if (!queueEntry || !queueEntry.establishmentId) return;

    const socket = getSocket();
    socketRef.current = socket;
    
    // Entrar na sala da fila
    const setupSocket = () => {
      if (socket.connected) {
        joinQueue(queueEntry.establishmentId);
        console.log('✅ Entrou na sala da fila:', queueEntry.establishmentId);
      } else {
        socket.once('connect', () => {
          joinQueue(queueEntry.establishmentId);
          console.log('✅ Conectado e entrou na sala da fila:', queueEntry.establishmentId);
        });
      }
    };
    
    setupSocket();
    
    // Função para lidar com atualizações da fila
    const handleQueueUpdate = (data) => {
      console.log('📊 Evento queue:update recebido:', data);
      // Buscar a entrada atualizada na fila
      const updatedEntry = data.queue?.find(
        entry => entry.id === queueEntry.id
      );
      if (updatedEntry) {
        setCurrentPosition(updatedEntry.position);
        // Atualizar localStorage
        const updated = { ...queueEntry, position: updatedEntry.position };
        localStorage.setItem(`queue_entry_${queueEntry.id}`, JSON.stringify(updated));
        setQueueEntry(updated);
        console.log('📍 Posição atualizada:', updatedEntry.position);
      }
    };
    
    // Função para lidar com chamada
    const handleQueueCalled = (data) => {
      console.log('🔔🔔🔔 Evento queue:called recebido:', data);
      console.log('🔍 Comparando IDs:', data.entry?.id, '===', queueEntry.id);
      console.log('🔍 Tipo dos IDs:', typeof data.entry?.id, typeof queueEntry.id);
      
      // Comparação mais robusta (string ou número)
      const entryId = String(data.entry?.id || '');
      const myId = String(queueEntry.id || '');
      
      if (entryId === myId) {
        console.log('✅ ID corresponde! Cliente foi chamado.');
        setIsCalled(true);
        
        // Atualizar localStorage
        const updated = { ...queueEntry, status: 'called' };
        localStorage.setItem(`queue_entry_${queueEntry.id}`, JSON.stringify(updated));
        setQueueEntry(updated);
        
        // Notificação do navegador (se permitido)
        console.log('🔔 Tentando criar notificação...');
        console.log('📱 Notification API disponível?', 'Notification' in window);
        console.log('📱 Permissão atual:', Notification.permission);
        
        if ('Notification' in window) {
          if (Notification.permission === 'granted') {
            try {
              console.log('✅ Permissão concedida, criando notificação...');
              const notification = new Notification('🔔 Sua vez chegou!', {
                body: `Você foi chamado na fila. Dirija-se ao atendimento!`,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'queue-called',
                requireInteraction: true,
              });
              
              // Focar na janela quando clicar na notificação
              notification.onclick = () => {
                window.focus();
                notification.close();
              };
              
              notification.onerror = (error) => {
                console.error('❌ Erro na notificação:', error);
              };
              
              console.log('✅ Notificação criada com sucesso:', notification);
            } catch (error) {
              console.error('❌ Erro ao criar notificação:', error);
              console.error('❌ Detalhes do erro:', error.message, error.stack);
            }
          } else if (Notification.permission === 'default') {
            console.log('⚠️ Permissão ainda não foi solicitada, tentando solicitar...');
            // Tentar solicitar permissão novamente
            Notification.requestPermission().then(permission => {
              console.log('📝 Nova permissão de notificação:', permission);
              if (permission === 'granted') {
                try {
                  const notification = new Notification('🔔 Sua vez chegou!', {
                    body: `Você foi chamado na fila. Dirija-se ao atendimento!`,
                    icon: '/favicon.ico',
                  });
                  console.log('✅ Notificação criada após solicitar permissão');
                } catch (error) {
                  console.error('❌ Erro ao criar notificação após permissão:', error);
                }
              }
            }).catch(error => {
              console.error('❌ Erro ao solicitar permissão:', error);
            });
          } else {
            console.warn('⚠️ Permissão de notificação negada pelo usuário');
          }
        } else {
          console.warn('⚠️ Notificações não são suportadas neste navegador');
        }
        
        // Scroll para o topo para garantir que o usuário veja o alerta
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        console.log('❌ ID não corresponde. Este evento não é para este cliente.');
      }
    };
    
    // Escutar atualizações da fila
    socket.on('queue:update', handleQueueUpdate);
    socket.on('queue:called', handleQueueCalled);
    
    // Log para confirmar que os listeners foram registrados
    console.log('🎧 Listeners WebSocket registrados:', {
      'queue:update': '✅',
      'queue:called': '✅',
      entryId: queueEntry.id,
      establishmentId: queueEntry.establishmentId
    });
    
    // Guardar handlers para limpeza depois
    socketRef.current.updateHandler = handleQueueUpdate;
    socketRef.current.calledHandler = handleQueueCalled;
    
    // Limpar ao desmontar
    return () => {
      if (socketRef.current) {
        if (socketRef.current.updateHandler) {
          socketRef.current.off('queue:update', socketRef.current.updateHandler);
        }
        if (socketRef.current.calledHandler) {
          socketRef.current.off('queue:called', socketRef.current.calledHandler);
        }
      }
      if (queueEntry?.establishmentId) {
        leaveQueue(queueEntry.establishmentId);
      }
    };
  }, [queueEntry]);

  // Solicitar permissão de notificação
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      setTimeout(() => {
        Notification.requestPermission();
      }, 1000);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando informações da fila...</p>
        </div>
      </div>
    );
  }

  if (error || !queueEntry) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Erro</h1>
            <p className="text-red-600 mb-6">{error || 'Entrada não encontrada'}</p>
            <button
              onClick={() => navigate('/fila')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Voltar para Entrar na Fila
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className={`rounded-lg shadow-lg p-8 border-2 ${
          isCalled 
            ? 'bg-yellow-100 border-yellow-500' 
            : 'bg-white border-gray-200'
        }`}>
          {isCalled ? (
            <>
              <div className="text-center mb-6">
                <h1 className="text-4xl font-bold text-yellow-900 mb-2 animate-pulse">
                  🔔 SUA VEZ CHEGOU!
                </h1>
                <p className="text-lg text-yellow-800">
                  Você foi chamado! Dirija-se ao atendimento.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 space-y-3">
                <p><strong>Nome:</strong> {queueEntry.name}</p>
                <p><strong>Telefone:</strong> {queueEntry.phone}</p>
                <p><strong>Estabelecimento:</strong> {queueEntry.establishmentId}</p>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Acompanhamento da Fila
              </h1>
              
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Sua posição atual</p>
                  <p className="text-6xl font-bold text-blue-600">
                    {currentPosition !== null ? currentPosition : queueEntry.position}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 space-y-3 mb-6">
                <p><strong>Nome:</strong> {queueEntry.name}</p>
                <p><strong>Telefone:</strong> {queueEntry.phone}</p>
                <p><strong>Estabelecimento:</strong> {queueEntry.establishmentId}</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 text-sm">
                <p className="text-green-800 mb-2">⚡ Atualização em tempo real ativa</p>
                {Notification.permission === 'granted' ? (
                  <p className="text-green-600">✅ Notificações ativadas</p>
                ) : Notification.permission === 'denied' ? (
                  <p className="text-red-600">❌ Notificações bloqueadas</p>
                ) : (
                  <p className="text-yellow-600">⚠️ Aguardando permissão de notificações...</p>
                )}
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/fila')}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Entrar com outro cliente
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
