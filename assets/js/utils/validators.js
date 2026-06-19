export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function validateEmail(email) {
  const value = normalizeEmail(email);
  if (!value) return 'El correo es obligatorio.';
  if (value.length > 254) return 'El correo es demasiado largo.';
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(value)) return 'Ingresa un correo válido.';
  return '';
}

export function validatePassword(password) {
  const value = String(password || '');
  if (!value) return 'La contraseña es obligatoria.';
  if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (!/[A-Za-z]/.test(value)) return 'La contraseña debe incluir letras.';
  if (!/\d/.test(value)) return 'La contraseña debe incluir al menos un número.';
  return '';
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!String(confirmPassword || '')) return 'Confirma tu contraseña.';
  if (String(password || '') !== String(confirmPassword || '')) {
    return 'Las contraseñas no coinciden.';
  }
  return '';
}

export function safeErrorMessage(error) {
  if (!error) return 'Ocurrió un error inesperado.';
  const message = typeof error.message === 'string' ? error.message : 'Ocurrió un error inesperado.';
  return message.replace(/\s+/g, ' ').trim();
}
