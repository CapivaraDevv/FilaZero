const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Função auxiliar para fazer requisições
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro na requisição');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// API de Fila
export const queueAPI = {
  // Adicionar à fila
  addToQueue: async (establishmentId, name, phone) => {
    return request('/queue', {
      method: 'POST',
      body: JSON.stringify({ establishmentId, name, phone }),
    });
  },

  // Obter fila (apenas esperando)
  getQueue: async (establishmentId) => {
    return request(`/queue/${establishmentId}`);
  },

  // Obter todas as entradas (admin)
  getAllEntries: async (establishmentId) => {
    return request(`/queue/${establishmentId}/all`);
  },

  // Chamar próximo
  callNext: async (establishmentId) => {
    return request(`/queue/${establishmentId}/call`, {
      method: 'POST',
    });
  },

  // Finalizar atendimento
  serveEntry: async (establishmentId, entryId) => {
    return request(`/queue/${establishmentId}/serve/${entryId}`, {
      method: 'POST',
    });
  },
};
