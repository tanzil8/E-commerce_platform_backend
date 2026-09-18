import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

dns.setServers(["1.1.1.1", "8.8.8.8"]);

console.log("MONGODB_URI:", process.env.MONGODB_URI);

let isConnected = false;

async function connectDB() {
    if (isConnected) {
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);

        isConnected = true;

        console.log("MongoDB connected successfully");
    } catch (error) {
        isConnected = false;

        console.error("MongoDB connection failed:");
        console.error(error.message);

        throw error;
    }
}



export default connectDB;