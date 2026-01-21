import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { queueAPI } from "../services/api.js";
import { getSocket, joinQueue, leaveQueue } from "../services/socketService.js";

export default function ClientQueue() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    establishment: '',
  })

  const [errors, setErrors] = useState({
    name: false,
    phone: false,
    establishment: false
  })

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [entryId, setEntryId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    const newErrors = { ...errors }
    newErrors.name = formData.name.trim() === ''
    newErrors.phone = formData.phone.trim() === ''
    newErrors.establishment = formData.establishment.trim() === ''

    setErrors(newErrors)

    if (newErrors.name || newErrors.phone || newErrors.establishment) {
      return;
    }

    setLoading(true);
    try {
      // Usar o ID do estabelecimento diretamente
      const establishmentId = formData.establishment;
      
      const response = await queueAPI.addToQueue(
        establishmentId,
        formData.name,
        formData.phone
      );

      setSuccess(response.message || 'Você foi adicionado à fila!');
      setEntryId(response.data.id);
      
      // Salvar entrada no localStorage para a página de acompanhamento
      localStorage.setItem(`queue_entry_${response.data.id}`, JSON.stringify(response.data));
      
      // Limpar formulário
      setFormData({
        name: '',
        phone: '',
        establishment: '',
      });
      
      // Redirecionar após 2 segundos para a página de acompanhamento
      setTimeout(() => {
        navigate(`/acompanhar/${response.data.id}`);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Erro ao entrar na fila. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }


  // Solicitar permissão de notificação quando o componente montar
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        // Solicitar permissão de forma mais amigável
        const requestPermission = async () => {
          try {
            const permission = await Notification.requestPermission();
            console.log('Permissão de notificação:', permission);
          } catch (error) {
            console.error('Erro ao solicitar permissão de notificação:', error);
          }
        };
        // Pequeno delay para não assustar o usuário
        setTimeout(requestPermission, 1000);
      } else {
        console.log('Status da permissão de notificação:', Notification.permission);
      }
    } else {
      console.warn('⚠️ Notificações não são suportadas neste navegador');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Entrar na Fila
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Nome Completo
              </label>
              <input
                value={formData.name}
                onChange={(e) => {
                  const value = e.target.value

                  setFormData({ ...formData, name: value })

                  setErrors(prev => ({
                    ...prev,
                    name: value.trim() === ''
                  }))
                }
                }
                type="text"
                placeholder="Seu nome"
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 ${errors.name ? "border-red-500" : "border-gray-300"}`}

              />
              {errors.name && <p className="text-red-500 text-sm">Campo obrigatório</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Telefone
              </label>
              <input
                value={formData.phone}
                onChange={(e) => {
                    const value = e.target.value

                    setFormData({ ...formData, phone: value })

                    setErrors(prev => ({
                      ...prev,
                      phone: value.trim() === ''
                    }))
                  }
                }
                type="tel"
                placeholder="(00) 99999-9999"
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-50 ${errors.phone ? "border-red-500" : "border-gray-300"}`}
              />

              {errors.phone && <p className="text-red-500 text-sm">Campo obrigatório</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Selecione o Estabelecimento
              </label>
              <select
                value={formData.establishment}
                onChange={(e) => {
                  const value = e.target.value
                  
                  setFormData({ ...formData, establishment: value })

                  setErrors(prev => ({
                    ...prev,
                    establishment: value.trim() === ''
                  }))

                  }
                }
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 ${errors.establishment ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">-- Selecione --</option>
                <option value="banco-central">Banco Central</option>
                <option value="farmacia-abc">Farmácia ABC</option>
                <option value="cartorio-xyz">Cartório XYZ</option>
              </select>
              {errors.establishment && <p className="text-red-500 text-sm">Campo obrigatório</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full cursor-pointer bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition mt-6 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Entrando na fila...' : 'Entrar na Fila'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && entryId && (
            <div className="mt-4 p-6 bg-green-100 border border-green-400 text-green-800 rounded-lg">
              <h3 className="font-bold text-lg mb-2">✓ {success}</h3>
              <p className="mb-4">Redirecionando para a página de acompanhamento...</p>
              <div className="bg-white rounded p-3 text-sm">
                <p className="text-gray-600 mb-2">Ou acesse diretamente:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/acompanhar/${entryId}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-xs"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/acompanhar/${entryId}`);
                      alert('Link copiado!');
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-xs"
                  >
                    Copiar Link
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
