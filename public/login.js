// public/js/login.js

// If somehow on login page while authenticated, redirect
// (optional: you can skip since server protects everything)

document.getElementById('loginBtn').addEventListener('click', async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const messageEl = document.getElementById('message');

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      // Server set httpOnly cookie automatically
      const role = data.role.toLowerCase();
      window.location.href = `/${role}-dashboard`; // ← no .html!
    } else {
      messageEl.innerText = data.error || 'Login failed';
    }
  } catch (err) {
    messageEl.innerText = 'Network error';
  }
});