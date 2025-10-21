// src/middleware/auth.js
const jwt = require('jsonwebtoken');

// src/middleware/auth.js
function authenticateToken(req, res, next) {
  const token = req.cookies?.token;
  console.log('🍪 Cookie token:', token ? '[PRESENT]' : '[MISSING]');
  
  if (!token) {
    console.log('➡️ Redirecting to login (no token)');
    return res.redirect('/login.html');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('❌ Invalid token:', err.message);
      res.clearCookie('token');
      return res.redirect('/login.html');
    }
    console.log('✅ Authenticated user:', user.username, 'Role:', user.role);
    req.user = user;
    next();
  });
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).send('Access denied: insufficient role');
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };