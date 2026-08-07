import user from "../models/user.js";
import bcrypt from "bcrypt";

export const signupUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existUser = await user.findOne({ email });
    if (existUser) {
      return res.status(4001).json({ message: "user already exists" });
    }
    const hashPassword = await bcrypt.hash(password, 10);

    await user.create({
      name,
      email,
      password: hashPassword,
    });

    res.status(200).json({ message: "user registered successfully" });
  } catch (error) {
    res.status(4001).json({ message: "server error", error });
  }
};
