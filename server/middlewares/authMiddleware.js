// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    //console.log("Auth Header:", authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send({
        success: false,
        message: "No token provided"
      });
    }

    const token = authHeader.split(' ')[1];
    //console.log("Received token:", token);

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set");
      return res.status(500).send({
        success: false,
        message: "Server configuration error"
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      //console.log("Decoded token:", decoded);
      
      // Add user info to request
      req.userId = decoded.userId;
      req.userRole = decoded.role;
      
      next();
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return res.status(401).send({
        success: false,
        message: "Invalid or expired token"
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).send({
      success: false,
      message: "Authentication error"
    });
  }
};
