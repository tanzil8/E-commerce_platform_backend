import product from "../models/product.js";

export const createProduct = async(req, res)=>{
const newProduct =await product.create(req.body)
res.status(201).json({message:"product create successful", newProduct})
try {
    
} catch (error) {
    res.status(404).json({message:"server error", error})
}

}

export const getProduct = async(req, res)=>{

    try {
        const Products = await product.find()
          res.status(201).json({message:"Get all products", Products})
    } catch (error) {
        res.status(404).json({message:"server error", error})
    }

}

export const updateProduct = async(req, res)=>{

    try {
        
      const update = await product.findByIdAndUpdate(
        req.params.id,
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
        
      await product.findByIdAndDelete(
        req.params.id
        
      )
res.status(201).json({message:"Product delete successfully"})
    } catch (error) {
         res.status(404).json({message:"server error", error})
    }
}