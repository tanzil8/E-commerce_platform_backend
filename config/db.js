import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

// Sirf local development ke liye (ISP DNS issue)
if (process.env.NODE_ENV !== "production") {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
}

let connectionPromise = null;

mongoose.connection.on("disconnected", () => {
  connectionPromise = null;
});

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      })
      .then(() => console.log("MongoDB connected successfully"))
      .catch((error) => {
        connectionPromise = null;
        console.error("MongoDB connection failed:", error.message);
        throw error;
      });
  }

  await connectionPromise;
}

export default connectDB;