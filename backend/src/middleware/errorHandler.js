export function errorHandler(err, req, res, next) {
  console.error('=== ERROR HANDLER ===');
  console.error('Error message:', err.message);
  console.error('Error code:', err.code);
  console.error('Error name:', err.name);
  console.error('Error stack:', err.stack);
  console.error('Request path:', req.path);
  console.error('Request method:', req.method);

  // Erro de validação do Prisma
  if (err.code === 'P2002') {
    return res.status(400).json({
      message: 'Dados duplicados. Este email ou CPF já está cadastrado.'
    });
  }

  // Erro de conexão com banco
  if (err.code === 'P1001' || err.message?.includes('Can\'t reach database')) {
    return res.status(503).json({
      message: 'Serviço temporariamente indisponível. Tente novamente em alguns instantes.'
    });
  }

  // Erro de validação do Multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: 'Arquivo muito grande. Máximo 5MB.'
    });
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token inválido ou expirado'
    });
  }

  // Erro genérico
  res.status(err.status || 500).json({
    message: err.message || 'Erro interno do servidor'
  });
}

