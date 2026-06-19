function byId(id) {
  return document.getElementById(id);
}

function setMessage(messageArea, type, text) {
  messageArea.innerHTML = '';
  if (!text) return;

  const el = document.createElement('div');
  el.className = `message ${type}`;
  el.textContent = text;
  messageArea.appendChild(el);
}

function setFieldError(name, text) {
  const node = document.querySelector(`[data-error-for="${name}"]`);
  if (node) node.textContent = text || '';
}

function clearErrors() {
  ['email', 'password', 'confirmPassword'].forEach((field) => setFieldError(field, ''));
}

export const authView = {
  refs: {},

  mount() {
    this.refs = {
      authView: byId('auth-view'),
      dashboardView: byId('dashboard-view'),
      form: byId('auth-form'),
      toggleModeBtn: byId('toggle-mode-btn'),
      submitBtn: byId('submit-btn'),
      togglePasswordBtn: byId('toggle-password-btn'),
      confirmPasswordField: byId('confirm-password-field'),
      modeKicker: byId('mode-kicker'),
      authTitle: byId('auth-title'),
      helperText: byId('form-helper'),
      messageArea: byId('message-area'),
      inlineAction: byId('inline-action'),
      inlineActionText: byId('inline-action-text'),
      resendConfirmationBtn: byId('resend-confirmation-btn'),
      email: byId('email'),
      password: byId('password'),
      confirmPassword: byId('confirmPassword'),
      logoutBtn: byId('logout-btn'),
      userEmail: byId('user-email'),
      userId: byId('user-id'),
      sessionStatus: byId('session-status')
    };

    return this.refs;
  },

  renderMode(mode) {
    const isRegister = mode === 'register';
    this.refs.modeKicker.textContent = isRegister ? 'Crear cuenta' : 'Bienvenido';
    this.refs.authTitle.textContent = isRegister ? 'Regístrate' : 'Inicia sesión';
    this.refs.submitBtn.textContent = isRegister ? 'Crear cuenta' : 'Iniciar sesión';
    this.refs.confirmPasswordField.classList.toggle('hidden', !isRegister);
    this.refs.helperText.textContent = isRegister
      ? 'Al registrarte podrías necesitar confirmar tu correo antes de iniciar sesión.'
      : 'Usa tu correo y contraseña para entrar.';
    this.hideInlineAction();
    clearErrors();
    this.clearMessage();
  },

  renderAuthState(session) {
    const authenticated = Boolean(session?.user);
    this.refs.authView.classList.toggle('hidden', authenticated);
    this.refs.dashboardView.classList.toggle('hidden', !authenticated);

    if (authenticated) {
      const user = session.user;
      this.refs.userEmail.textContent = user.email || 'Correo no disponible';
      this.refs.userId.textContent = `ID: ${user.id}`;
      this.refs.sessionStatus.textContent = 'Sesión activa y persistente.';
    } else {
      this.refs.userEmail.textContent = '';
      this.refs.userId.textContent = '';
      this.refs.sessionStatus.textContent = 'Sin sesión activa.';
    }
  },

  setLoading(isLoading) {
    this.refs.submitBtn.disabled = isLoading;
    this.refs.logoutBtn.disabled = isLoading;
    this.refs.resendConfirmationBtn.disabled = isLoading && !this.refs.resendConfirmationBtn.classList.contains('hidden');
    this.refs.submitBtn.textContent = isLoading
      ? 'Procesando…'
      : (this.refs.confirmPasswordField.classList.contains('hidden') ? 'Iniciar sesión' : 'Crear cuenta');
    this.refs.resendConfirmationBtn.textContent = isLoading ? 'Enviando…' : 'Reenviar confirmación';
  },

  setPasswordVisibility(visible) {
    this.refs.password.type = visible ? 'text' : 'password';
    if (!this.refs.confirmPasswordField.classList.contains('hidden')) {
      this.refs.confirmPassword.type = visible ? 'text' : 'password';
    }
    this.refs.togglePasswordBtn.textContent = visible ? '🙈' : '👁️';
  },

  getFormData() {
    return {
      email: this.refs.email.value,
      password: this.refs.password.value,
      confirmPassword: this.refs.confirmPassword.value
    };
  },

  setFieldErrors(errors = {}) {
    clearErrors();
    Object.entries(errors).forEach(([field, value]) => setFieldError(field, value));
  },

  clearForm() {
    this.refs.form.reset();
    this.setPasswordVisibility(false);
  },

  showMessage(type, text) {
    setMessage(this.refs.messageArea, type, text);
  },

  clearMessage() {
    this.refs.messageArea.innerHTML = '';
  },

  focusEmail() {
    this.refs.email.focus();
  },

  setMode(nextMode) {
    this.renderMode(nextMode);
  },

  showInlineAction(text, buttonLabel = 'Reenviar confirmación') {
    this.refs.inlineActionText.textContent = text;
    this.refs.resendConfirmationBtn.textContent = buttonLabel;
    this.refs.inlineAction.classList.remove('hidden');
  },

  hideInlineAction() {
    this.refs.inlineAction.classList.add('hidden');
    this.refs.inlineActionText.textContent = '';
  }
};
