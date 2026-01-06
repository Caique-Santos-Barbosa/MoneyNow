export function validatePassword(password) {
  if (password.length < 8) {
    return 'Senha deve ter no mínimo 8 caracteres';
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return 'Senha deve conter pelo menos uma letra minúscula';
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Senha deve conter pelo menos uma letra maiúscula';
  }

  if (!/(?=.*\d)/.test(password)) {
    return 'Senha deve conter pelo menos um número';
  }

  return null; // Senha válida
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateCPF(cpf) {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) {
    return false;
  }

  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }

  // Validar dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(9))) {
    return false;
  }

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(10))) {
    return false;
  }

  return true;
}

