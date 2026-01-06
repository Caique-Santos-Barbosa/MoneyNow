/**
 * Utilitários para validações
 */

/**
 * Valida email
 */
export function validateEmail(email) {
  if (!email) return 'Email é obrigatório';
  if (!/\S+@\S+\.\S+/.test(email)) return 'Email inválido';
  return null;
}

/**
 * Valida senha
 */
export function validatePassword(password) {
  if (!password) return 'Senha é obrigatória';
  if (password.length < 8) return 'Senha deve ter no mínimo 8 caracteres';
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return 'Senha deve conter maiúscula, minúscula e número';
  }
  return null;
}

/**
 * Calcula força da senha (0-5)
 */
export function calculatePasswordStrength(password) {
  if (!password) return 0;
  
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;
  
  return strength;
}

/**
 * Retorna texto da força da senha
 */
export function getPasswordStrengthText(password) {
  const strength = calculatePasswordStrength(password);
  
  if (strength <= 2) return { text: 'Senha fraca', color: '#FF5252' };
  if (strength <= 3) return { text: 'Senha média', color: '#FFC107' };
  if (strength <= 4) return { text: 'Senha forte', color: '#00D68F' };
  return { text: 'Senha muito forte', color: '#00B578' };
}

/**
 * Valida nome
 */
export function validateName(name) {
  if (!name || !name.trim()) return 'Nome é obrigatório';
  if (name.trim().length < 3) return 'Nome deve ter no mínimo 3 caracteres';
  return null;
}

