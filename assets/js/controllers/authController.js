import { authModel } from '../models/authModel.js';
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  normalizeEmail,
  safeErrorMessage
} from '../utils/validators.js';
import { authView } from '../views/authView.js';

function mapSupabaseError(error) {
  const message = safeErrorMessage(error);
  const lower = message.toLowerCase();

  if (lower.includes('email not confirmed')) {
    return 'Tu correo aún no está confirmado. Puedes reenviar el enlace de confirmación.';
  }

  if (lower.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos.';
  }

  if (lower.includes('user already registered')) {
    return 'Ese correo ya está registrado.';
  }

  if (lower.includes('email rate limit') || lower.includes('too many requests')) {
    return 'Demasiados intentos. Intenta más tarde.';
  }

  if (lower.includes('password') && lower.includes('weak')) {
    return 'La contraseña es demasiado débil.';
  }

  return message;
}

function isEmailNotConfirmed(error) {
  const message = safeErrorMessage(error).toLowerCase();
  return message.includes('email not confirmed');
}

export function createAuthController() {
  let mode = 'login';
  let passwordVisible = false;
  let initialized = false;
  let subscription = null;
  let resendTargetEmail = '';

  const refs = authView.mount();

  function syncPasswordVisibility() {
    authView.setPasswordVisibility(passwordVisible);
  }

  function setMode(nextMode) {
    mode = nextMode;
    passwordVisible = false;
    authView.setMode(mode);
    syncPasswordVisibility();
  }

  async function loadSession() {
    authView.showMessage('info', 'Verificando sesión…');
    const { data, error } = await authModel.getSession();

    if (error) {
      authView.showMessage('error', mapSupabaseError(error));
      authView.renderAuthState(null);
      return null;
    }

    authView.renderAuthState(data?.session || null);
    authView.clearMessage();
    return data?.session || null;
  }

  function bindEvents() {
    refs.toggleModeBtn.addEventListener('click', () => {
      setMode(mode === 'login' ? 'register' : 'login');
    });

    refs.togglePasswordBtn.addEventListener('click', () => {
      passwordVisible = !passwordVisible;
      syncPasswordVisibility();
    });

    refs.form.addEventListener('submit', handleSubmit);
    refs.logoutBtn.addEventListener('click', handleLogout);
    refs.resendConfirmationBtn.addEventListener('click', handleResendConfirmation);
  }

  function validateForm() {
    const values = authView.getFormData();
    const errors = {
      email: validateEmail(values.email),
      password: validatePassword(values.password),
      confirmPassword: ''
    };

    if (mode === 'register') {
      errors.confirmPassword = validateConfirmPassword(values.password, values.confirmPassword);
    }

    const visibleErrors = Object.fromEntries(
      Object.entries(errors).filter(([, value]) => value)
    );

    authView.setFieldErrors(errors);
    return {
      valid: Object.keys(visibleErrors).length === 0,
      values: {
        email: normalizeEmail(values.email),
        password: values.password,
        confirmPassword: values.confirmPassword
      },
      errors: visibleErrors
    };
  }

  function showResendPrompt(email, text) {
    resendTargetEmail = normalizeEmail(email);
    authView.showInlineAction(text, 'Reenviar confirmación');
  }

  function hideResendPrompt() {
    resendTargetEmail = '';
    authView.hideInlineAction();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const result = validateForm();
    if (!result.valid) return;

    authView.setLoading(true);
    authView.clearMessage();
    hideResendPrompt();

    try {
      const response =
        mode === 'register'
          ? await authModel.signUp(result.values.email, result.values.password)
          : await authModel.signIn(result.values.email, result.values.password);

      if (response.error) throw response.error;

      if (mode === 'register') {
        const session = response.data?.session || null;
        const needsEmailConfirmation = !session;
        authView.showMessage(
          needsEmailConfirmation ? 'info' : 'success',
          needsEmailConfirmation
            ? 'Cuenta creada. Revisa tu correo para confirmar la cuenta antes de iniciar sesión.'
            : 'Cuenta creada y sesión iniciada correctamente.'
        );
        if (needsEmailConfirmation) {
          showResendPrompt(result.values.email, 'Si no recibiste el correo, puedes reenviarlo aquí.');
        }
      } else {
        authView.showMessage('success', 'Sesión iniciada correctamente.');
      }

      authView.clearForm();
      const session = response.data?.session || (await authModel.getSession()).data?.session || null;
      authView.renderAuthState(session);
      setMode('login');
    } catch (error) {
      const friendly = mapSupabaseError(error);
      authView.showMessage('error', friendly);

      if (isEmailNotConfirmed(error)) {
        showResendPrompt(
          result.values.email,
          'Tu cuenta todavía no está confirmada. Reenvío el enlace al mismo correo.'
        );
      }
    } finally {
      authView.setLoading(false);
    }
  }

  async function handleResendConfirmation() {
    const email = resendTargetEmail || normalizeEmail(refs.email.value);
    const emailError = validateEmail(email);

    if (emailError) {
      authView.showMessage('error', emailError);
      return;
    }

    authView.setLoading(true);
    try {
      const { error } = await authModel.resendConfirmation(email);
      if (error) throw error;

      authView.showMessage(
        'success',
        'Enlace de confirmación reenviado. Revisa tu bandeja de entrada y la carpeta de spam.'
      );
    } catch (error) {
      authView.showMessage('error', mapSupabaseError(error));
    } finally {
      authView.setLoading(false);
    }
  }

  async function handleLogout() {
    authView.setLoading(true);
    try {
      const { error } = await authModel.signOut();
      if (error) throw error;
      authView.showMessage('success', 'Sesión cerrada correctamente.');
      authView.renderAuthState(null);
      authView.focusEmail();
    } catch (error) {
      authView.showMessage('error', mapSupabaseError(error));
    } finally {
      authView.setLoading(false);
    }
  }

  async function start() {
    if (initialized) return;
    initialized = true;

    bindEvents();
    setMode('login');

    subscription = authModel.onAuthStateChange((_event, session) => {
      authView.renderAuthState(session);
      authView.clearMessage();
      hideResendPrompt();
    });

    await loadSession();
  }

  return {
    start,
    destroy() {
      if (subscription?.data?.subscription?.unsubscribe) {
        subscription.data.subscription.unsubscribe();
      }
    }
  };
}
