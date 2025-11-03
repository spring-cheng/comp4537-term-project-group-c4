const API_BASE_URL = 'http://localhost:4000/api';
let MESSAGES = {};

async function loadMessages() {
  try {
    const module = await import('./lang/messages/en/user.js');
    MESSAGES = module.MESSAGES;
  } catch (error) {
    console.error('Failed to load messages:', error);
  }
}

function showMessage(elementId, message, isError = false) {
  const messageEl = document.getElementById(elementId);
  if (!messageEl) return;
  
  messageEl.textContent = message;
  messageEl.className = isError ? 'message error' : 'message success';
  messageEl.style.display = 'block';
  
  setTimeout(() => {
    messageEl.style.display = 'none';
  }, 5000);
}

async function handleRegistration(event) {
  event.preventDefault();

  const form = event.target;
  const email = form.email.value.trim();
  const password = form.password.value;

  if (!email || !password) {
    showMessage('message', MESSAGES.fillAllFields, true);
    return;
  }

  if (password.length < 6) {
    showMessage('message', MESSAGES.passwordMinLength, true);
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = MESSAGES.registering;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.error) {
      showMessage('message', data.error, true);
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    } else {
      showMessage('message', data.message || MESSAGES.registrationSuccess, false);

      if (data.token) {
        localStorage.setItem('jwt', data.token);
        localStorage.setItem('role', data.user.role);
      }

      setTimeout(() => {
        if (data.user.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard';
        }
      }, 1500);
    }
  } catch (error) {
    console.error('Registration error:', error);
    showMessage('message', MESSAGES.networkError, true);
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

async function handleLogin(event) {
  event.preventDefault();

  const form = event.target;
  const email = form.email.value.trim();
  const password = form.password.value;

  if (!email || !password) {
    showMessage('message', MESSAGES.fillAllFields, true);
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = MESSAGES.loggingIn;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.error) {
      showMessage('message', data.error, true);
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    } else {
      showMessage('message', data.message || MESSAGES.loginSuccess, false);

      if (data.token) {
        localStorage.setItem('jwt', data.token);
        localStorage.setItem('role', data.user.role);
      }

      const user = data.user;
      setTimeout(() => {
        if (user.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard';
        }
      }, 1500);
    }
  } catch (error) {
    console.error('Login error:', error);
    showMessage('message', MESSAGES.networkError, true);
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadMessages();

  const registrationForm = document.getElementById('registrationForm');
  if (registrationForm) registrationForm.addEventListener('submit', handleRegistration);

  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);
});
