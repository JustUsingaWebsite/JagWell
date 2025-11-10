module.exports = (app, authenticateToken, authorizeRoles, path) => {

// 🔐 PROTECTED DASHBOARD ROUTES
    app.get('/admin-dashboard', authenticateToken, authorizeRoles('Admin'), (req, res) => {
        res.sendFile(path.join(__dirname, '..', '..', '..', 'views', 'admin', 'admin-dashboard.html'));
    });

}