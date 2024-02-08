// authMiddleware.mjs
const authenticateUser = (req, res, next) => {
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};

export default authenticateUser;