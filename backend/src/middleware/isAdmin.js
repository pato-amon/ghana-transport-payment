const isAdmin = (req, res, next) => {
    // Assumes your auth middleware runs before this and attaches req.user
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admins only.'
        });
    }
};

module.exports = isAdmin;