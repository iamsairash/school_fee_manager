import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error(
    "JWT_SECRET is missing or too short. Add it to server/.env (see Step 12, section 1).",
  );
}

const COOKIE_NAME = "token";
const SESSION_HOURS = 8;

// Same options are needed to set and to clear the cookie
const baseCookie = {
  httpOnly: true, // JavaScript in the page cannot read it
  sameSite: "lax", // not sent on cross-site POST/PATCH requests
  secure: process.env.NODE_ENV === "production", // HTTPS only when deployed
};

export function signToken(userId) {
  return jwt.sign({}, JWT_SECRET, {
    subject: String(userId),
    expiresIn: `${SESSION_HOURS}h`,
    algorithm: "HS256",
  });
}

export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    ...baseCookie,
    maxAge: SESSION_HOURS * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, baseCookie);
}

// Middleware: lets the request through only if it carries a valid token
export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "Please log in." });

  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
    req.userId = payload.sub;
    next();
  } catch {
    res
      .status(401)
      .json({ error: "Your session has expired. Please log in again." });
  }
}
