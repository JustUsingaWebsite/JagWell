module.exports = (app, authenticateToken, authorizeRoles, path) => {

    app.get('/doctor-dashboard', authenticateToken, authorizeRoles('Doctor'), (req, res) => {
        res.sendFile(path.join(__dirname, '..', '..', '..', 'views', 'doctor', 'doctor-dashboard.html'));
    });

    app.get('/doctor-patients', authenticateToken, authorizeRoles('Doctor'), (req, res) => {
        res.sendFile(path.join(__dirname, '..', '..', '..', 'views', 'doctor', 'doctor-patients.html'));
    });

    app.get('/doctor-logging', authenticateToken, authorizeRoles('Doctor'), (req, res) => {
        res.sendFile(path.join(__dirname, '..', '..', '..', 'views', 'doctor', 'doctor-logging.html'));
    });

    app.get('/doctor-stats', authenticateToken, authorizeRoles('Doctor'), (req, res) => {
        res.redirect('wip.html');
        //res.sendFile(path.join(__dirname, '..', '..', '..', 'views', 'doctor', 'doctor-stats.html'));
    });
}