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


export const loginUser = async (req, res) =>{

  try {
    const {email, password} = req.body;

   const User = await user.findOne({ email });
    if (!User) {
      return res.status(4001).json({ message: "user not exists" });
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(400).json({message:"Invalid credentials"})
    }

    const token = jwt.sign(
      {id: user._id},
      process.env.JWT_SECRET,
      {expiresIn: "7d"}
    )
    res.json({
      message: "Login successful",
      token,
      user:{
        id: user._id,
        name:user.name,
        email:user.email
      }
    })

  } catch (error) {
     res.status(4001).json({ message: "server error", error });
  }

}