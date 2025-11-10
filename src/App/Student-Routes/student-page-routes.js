// src/App/Student-Routes/student-page-routes.js
module.exports = (app, authenticateToken, authorizeRoles, path) => {

  app.get('/student-dashboard', authenticateToken, authorizeRoles('Student'), (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', '..', 'views', 'student', 'student-home.html'));
  });

  app.get('/student-log', authenticateToken, authorizeRoles('Student'), (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', '..', 'views', 'student', 'student-log.html'));
  });

  app.get('/student-trends', authenticateToken, authorizeRoles('Student'), (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', '..', 'views', 'student', 'student-trends.html'));
  });

  app.get('/student-profile', authenticateToken, authorizeRoles('Student'), (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', '..', 'views', 'student', 'student-profile.html'));
  });
};