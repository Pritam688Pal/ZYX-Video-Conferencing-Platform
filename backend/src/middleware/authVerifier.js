import jwt from "jsonwebtoken";
import httpStatus from "http-status";

const authVerifier = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Token missing from request authorization header" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    req.user = decoded.userId || decoded.id; 
    
    next();
  } catch (error) {
    return res
      .status(httpStatus.UNAUTHORIZED)
      .json({ 
        message: "Authentication failed: Invalid or expired token", 
        error: error.message
      });
  }
};

export default authVerifier;