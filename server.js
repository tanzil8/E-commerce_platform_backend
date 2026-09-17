import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import dns from "dns";

import router from "./routers/userRouter.js";
import cloudinaryRU from "./routers/cloudnary.js";

// ✅ Kuch ISPs/networks (local dev) mongodb+srv:// ka SRV DNS record resolve nahi kar pate,
// isi wajah se "querySrv ECONNREFUSED" error aata hai. Cloudflare/Google DNS force karne se fix ho jata hai.
// try/catch mein rakha hai taake production (Vercel) mein agar ye fail ho to poori function crash na ho.
try {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
} catch (err) {
  console.error("dns.setServers failed, continuing with default DNS:", err.message);
}

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Global cache (serverless optimized - Vercel har request pe naya connection nahi banaega)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToMongoDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000, // ❗ timeout add
      })
      .then((mongoose) => {
        console.log("MongoDB connected");
        return mongoose;
      })
      .catch((err) => {
        console.error("MongoDB connection error:", err);
        throw err; // ❗ important
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// ✅ Middleware with error handling (VERY IMPORTANT) - har request se pehle DB connect
app.use(async (req, res, next) => {
  try {
    await connectToMongoDB();
    next();
  } catch (error) {
    return res.status(500).json({
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// ✅ Test route (debug ke liye useful)
app.get("/test", (req, res) => {
  res.send("Backend working ✅");
});

// Routes
app.get("/", (req, res) => {
  res.send("Hello world");
});

app.use("/api", router);
app.use("/api/product", cloudinaryRU);

// ✅ Global error handler (last middleware) - kisi bhi route se thrown error yahan catch hoga
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

// ✅ Local dev ke lia optional listener - Vercel ismein khud request handle karega, ye sirf "node server.js" se local test karne ke lia hai
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running locally on port ${PORT}`));
}

// ✅ Export (NO app.listen call for production - Vercel isi export ko serverless function bana deta hai)
export default app;