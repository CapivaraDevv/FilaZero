// Middleware para validação de entrada de dados

// Validar campos obrigatórios para adicionar à fila
export const validateQueueEntry = (req, res, next) => {
  const { establishmentId, name, phone } = req.body;

  // Verificar campos obrigatórios
  if (!establishmentId || !name || !phone) {
    return res.status(400).json({
      error: 'Campos obrigatórios: establishmentId, name, phone',
    });
  }

  // Validar nome (não vazio, min 3 caracteres)
  if (name.trim().length < 3) {
    return res.status(400).json({
      error: 'Nome deve ter pelo menos 3 caracteres',
    });
  }

  // Validar telefone (básico: números e hífens)
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (!phoneRegex.test(phone.trim())) {
    return res.status(400).json({
      error: 'Telefone inválido',
    });
  }

  // Validar establishmentId (deve ser string não vazia)
  if (establishmentId.trim().length === 0) {
    return res.status(400).json({
      error: 'ID do estabelecimento é obrigatório',
    });
  }

  next();
};

// Validar establishmentId nos parâmetros
export const validateEstablishmentId = (req, res, next) => {
  const { establishmentId } = req.params;

  if (!establishmentId || establishmentId.trim().length === 0) {
    return res.status(400).json({
      error: 'ID do estabelecimento é obrigatório',
    });
  }

  next();
};

// Validar establishmentId e entryId
export const validateEntryParams = (req, res, next) => {
  const { establishmentId, entryId } = req.params;

  if (!establishmentId || establishmentId.trim().length === 0) {
    return res.status(400).json({
      error: 'ID do estabelecimento é obrigatório',
    });
  }

  if (!entryId || entryId.trim().length === 0) {
    return res.status(400).json({
      error: 'ID da entrada é obrigatório',
    });
  }

  next();
};
