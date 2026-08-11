import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js"
import router from "./routers/userRouter.js";
import product from "./routers/productRouter.js"

const app = express();
dotenv.config();

app.use(express.json());
app.use(cors());
app.use('/api', router)
app.use('/api/product', product)

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(process.env.PORT, () => {
  console.log("server is runing");
});

connectDB();
