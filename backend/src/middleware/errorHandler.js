export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Erro de validação do Prisma
  if (err.code === 'P2002') {
    return res.status(400).json({
      message: 'Dados duplicados. Este email ou CPF já está cadastrado.'
    });
  }

  // Erro de validação do Multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: 'Arquivo muito grande. Máximo 5MB.'
    });
  }

  // Erro genérico
  res.status(err.status || 500).json({
    message: err.message || 'Erro interno do servidor'
  });
}

