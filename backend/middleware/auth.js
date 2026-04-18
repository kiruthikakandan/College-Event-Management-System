const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Get token from header
    const header = req.header('Authorization');

    if (!header) {
      return res.status(401).json({ message: "No token, access denied" });
    }

    // Extract token (Bearer token)
    const token = header.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = decoded;

    next();

  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = auth;