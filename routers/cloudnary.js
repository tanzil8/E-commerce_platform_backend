import express from "express";
import fs from "fs";
import { upload, handleUploadError } from "../middleware/multer.js";
import cloudinary from "../middleware/cloudinary.js";
import product from "../model/product.js";

const router = express.Router();

// ============ CREATE: Upload product with image ============
router.post("/upload", (req, res, next) => {
    upload.single("file")(req, res, async (err) => {
        if (err) return handleUploadError(err, req, res, next);

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded." });
        }

        try {
            const result = await cloudinary.uploader.upload(req.file.path, {
                resource_type: "auto", // handles images, pdf, video etc.
            });

            const newProduct = new product({
                title: req.body.title,
                description: req.body.description,
                price: req.body.price,
                category: req.body.category,
                image: result.secure_url,
                stock: req.body.stock,
                cloudinary_id: result.public_id,
            });

            await newProduct.save();

            res.status(201).json({
                message: "File uploaded successfully",
                file: {
                    originalName: req.file.originalname,
                    size: req.file.size,
                    mimetype: req.file.mimetype,
                },
                result: newProduct,
            });
        } catch (uploadErr) {
            res.status(500).json({
                error: "Cloudinary upload failed",
                details: uploadErr.message,
            });
        } finally {
            // Clean up local temp file regardless of success/failure
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) {
                    console.error("Failed to delete local file:", unlinkErr);
                }
            });
        }
    });
});

// ============ READ: Get all products ============
router.get("/", async (req, res) => {
    try {
        const products = await product.find();

        if (products.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }

        res.status(200).json({
            message: "Products fetched successfully",
            count: products.length,
            data: products,
        });
    } catch (err) {
        res.status(500).json({
            error: "Failed to fetch products",
            details: err.message,
        });
    }
});

// ============ READ: Get single product by ID ============
router.get("/get/:id", async (req, res) => {
    try {
        const singleProduct = await product.findById(req.params.id);

        if (!singleProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json({
            message: "Product fetched successfully",
            data: singleProduct,
        });
    } catch (err) {
        res.status(500).json({
            error: "Failed to fetch product",
            details: err.message,
        });
    }
});

// ============ UPDATE: Update product (with optional image) ============
router.put("/update/:id", (req, res, next) => {
    upload.single("file")(req, res, async (err) => {
        if (err) return handleUploadError(err, req, res, next);

        try {
            const existingProduct = await product.findById(req.params.id);

            if (!existingProduct) {
                return res.status(404).json({ error: "Product not found" });
            }

            // Prepare update data
            const updateData = {
                title: req.body.title || existingProduct.title,
                description: req.body.description || existingProduct.description,
                price: req.body.price || existingProduct.price,
                category: req.body.category || existingProduct.category,
                stock: req.body.stock || existingProduct.stock,
            };

            // If new image is uploaded, delete old one and upload new
            if (req.file) {
                try {
                    // Delete old image from Cloudinary
                    if (existingProduct.cloudinary_id) {
                        await cloudinary.uploader.destroy(existingProduct.cloudinary_id);
                    }

                    // Upload new image
                    const result = await cloudinary.uploader.upload(req.file.path, {
                        resource_type: "auto",
                    });

                    updateData.image = result.secure_url;
                    updateData.cloudinary_id = result.public_id;
                } catch (cloudinaryErr) {
                    return res.status(500).json({
                        error: "Cloudinary update failed",
                        details: cloudinaryErr.message,
                    });
                }
            }

            // Update product
            const updatedProduct = await product.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true, runValidators: true }
            );

            res.status(200).json({
                message: "Product updated successfully",
                data: updatedProduct,
            });
        } catch (err) {
            res.status(500).json({
                error: "Failed to update product",
                details: err.message,
            });
        } finally {
            // Clean up local temp file if uploaded
            if (req.file) {
                fs.unlink(req.file.path, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error("Failed to delete local file:", unlinkErr);
                    }
                });
            }
        }
    });
});

// ============ DELETE: Delete product ============
router.delete("/delete/:id", async (req, res) => {
    try {
        const productToDelete = await product.findById(req.params.id);

        if (!productToDelete) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Delete image from Cloudinary
        if (productToDelete.cloudinary_id) {
            try {
                await cloudinary.uploader.destroy(productToDelete.cloudinary_id);
            } catch (cloudinaryErr) {
                console.error("Failed to delete from Cloudinary:", cloudinaryErr);
                // Continue with product deletion even if Cloudinary deletion fails
            }
        }

        // Delete product from database
        await product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Product deleted successfully",
            data: productToDelete,
        });
    } catch (err) {
        res.status(500).json({
            error: "Failed to delete product",
            details: err.message,
        });
    }
});

export default router;