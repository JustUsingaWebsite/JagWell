module.exports = (app, authenticateToken, authorizeRoles, path) => {
  // API Routes
  app.use('/api/auth', require('../../routes/auth'));
  app.use('/api/wellness', authenticateToken, require('../../routes/wellness'));
};