import User from "../models/User.js";
import { updateMeSchema } from "../validators/users.validators.js";

export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user: { _id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    return next(err);
  }
}

export async function updateMe(req, res, next) {
  try {
    const parsed = updateMeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

    const { name, email } = parsed.data;

    const emailOwner = await User.findOne({ email });
    if (emailOwner && emailOwner._id.toString() !== req.user.id) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user: { _id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    return next(err);
  }
}
