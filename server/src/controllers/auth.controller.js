import bcrypt from "bcrypt";
import User from "../models/User.js";
import { signAccessToken } from "../services/token.service.js";
import { registerSchema, loginSchema } from "../validators/auth.validators.js";

export async function register(req, res, next) {
  try {
    console.log(req.body)
    const parsed = registerSchema.safeParse(req.body);
    console.log(parsed)
    if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

    const { name, email, password } = parsed.data;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    const token = signAccessToken({ sub: user._id.toString() });

    return res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

    const { email, password } = parsed.data;

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signAccessToken({ sub: user._id.toString() });

    return res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    return next(err);
  }
}

export async function logout(req, res) {
  // With Authorization header JWT, logout is handled client-side by removing token.
  return res.json({ ok: true });
}
