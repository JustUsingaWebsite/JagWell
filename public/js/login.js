document.getElementById('loginBtn').addEventListener('click', async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (res.ok) {
    localStorage.setItem('token', data.token);
    const role = data.role.toLowerCase();
    localStorage.setItem('role', role);
    window.location.href = `${role}-dashboard.html`;
  } else {
    document.getElementById('message').innerText = data.error;
  }
});