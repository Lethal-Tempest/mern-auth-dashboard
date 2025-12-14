import { verifyAccessToken } from "../services/token.service.js";

export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.sub };
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
