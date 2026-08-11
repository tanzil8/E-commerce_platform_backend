import product from "../models/product";

export const createProduct = async(req, res)=>{
const product =await product.create(req.body)
res.status(201).json({message:"product create successful", product})
try {
    
} catch (error) {
    res.status(404).json({message:"server error", error})
}

}

export const getProduct = async(req, res)=>{

    try {
        const products = await product.find().short({createdAt: -1})
          res.status(201).json({message:"Get all products", products})
    } catch (error) {
        res.status(404).json({message:"server error", error})
    }

}

export const updateProduct = async(req, res)=>{

    try {
        
      const update = await product.findByIdAndUpdate(
        req.params._id,
        req.body,
        {new: true}
      )
res.status(201).json({message:"Product update successfully", update})
    } catch (error) {
         res.status(404).json({message:"server error", error})
    }
}
export const deleteProduct = async(req, res)=>{

    try {
        
      const delete = await product.findByIdAndDelete(
        req.params._id,
        
      )
res.status(201).json({message:"Product delete successfully", delete})
    } catch (error) {
         res.status(404).json({message:"server error", error})
    }
}