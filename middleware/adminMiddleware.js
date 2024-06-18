const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access forbidden: Admins only' });
    }
  
    next(); // Allow further execution if the user is an admin
  };
  
  module.exports = adminMiddleware;
  