import express from "express";
import fs from "fs";
import { upload, handleUploadError } from "../utils/multer.js";
import cloudinary from "../utils/cloudinary.js";

const router = express.Router();

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

            res.json({
                message: "File uploaded successfully",
                file: {
                    originalName: req.file.originalname,
                    size: req.file.size,
                    mimetype: req.file.mimetype,
                },
                result: {
                    url: result.secure_url,
                    public_id: result.public_id,
                },
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

export default router;