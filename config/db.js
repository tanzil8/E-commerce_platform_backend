import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns"
dotenv.config()

dns.setServers(["1.1.1.1", "8.8.8.8"])

const connectDB = async () =>{

    try {
      await mongoose.connect(process.env.MONGODB_URI)
      console.log('MongoDB connect');
      
    } catch (error) {
        console.log(error.message);
        
    }

}

export default connectDB