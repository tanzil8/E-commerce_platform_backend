
import { Timestamp } from "mongodb";
import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    title: {
      type: String,
      
    },
    description: {
      type: String,
      
    },
    price: {
      type: Number,
      
    },
    category: {
      type: String,
      
    },
    image: {
      type: String,
      
    },
    stock: {
      type: Number,
      
      default: 0,
    },
    cloudinary_id:{
      type: String
    }
  },
  {timestamps: true},
);

export default mongoose.model("product", productSchema);
