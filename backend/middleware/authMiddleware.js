import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev_secret_change_in_production";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (_err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
