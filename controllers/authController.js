import user from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

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


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const foundUser = await user.findOne({ email }).select("+password"); 
    // agar password field select:false nahi hai to .select("+password") hata dena

    if (!foundUser) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: foundUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: foundUser._id,
        name: foundUser.name,
        email: foundUser.email,
      },
    });
  } catch (error) {
    console.error(error); // debugging ke liye server-side log karo
    res.status(500).json({ message: "Server error" }); // raw error client ko mat bhejo
  }
};