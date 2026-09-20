import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./config/db.js";
import router from "./routers/userRouter.js";
import cloudinaryRU from "./routers/cloudnary.js";

const app = express();

app.use(express.json());
app.use(cors());

// DB connection: routes se PEHLE
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("DB connection error:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      reason: error.message, // TEMPORARY: masla hal hone ke baad ye line hata do
    });
  }
});

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.use("/api", router);
app.use("/api/product", cloudinaryRU);

if (process.env.NODE_ENV !== "production") {
  app.listen(process.env.PORT || 5000, () => console.log("Server running"));
}

export default app;