const Equb = require('../models/equb');

const equbAdminMiddleware = async (req, res, next) => {
  const { id } = req.params; // Equb ID from the route
  const userId = req.user._id; // Authenticated user ID

  const equb = await Equb.findById(id);

  if (!equb) {
    return res.status(404).json({ message: 'Equb not found' });
  }

  if (equb.admin.toString() !== userId.toString()) {
    return res.status(403).json({ message: 'Access forbidden: You are not the Equb admin' });
  }

  next(); // User is the admin of this Equb, proceed with the request
};

module.exports = equbAdminMiddleware;
