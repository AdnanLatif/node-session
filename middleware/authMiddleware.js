const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(' ')[1];
  const secretKey = process.env.SECRET_JWT_KEY;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);

    // Calculate the new expiry time (one hour from now)
    const currentTime = Math.floor(Date.now() / 1000);
    const newExpiryTime = currentTime + 3600; // 3600 seconds = 1 hour

    // Update the token with the new expiry time
    const updatedToken = jwt.sign(
      { user: decoded.user, exp: newExpiryTime },
      secretKey
    );

    req.user = decoded.user;
    req.headers.authorization = `Bearer ${updatedToken}`;
    next();
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
};

const authorizeUser = (req, res, next) => {
  // Check if the user is an admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden: You are not authorized to perform this action.',
    });
  }

  // Move to the next middleware
  next();
};

module.exports = {
  authenticateUser,
  authorizeUser,
};
