import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// Ensure uploads directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed mime types — adjust to your needs
const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        // Original code had a bug: it dropped the base filename entirely,
        // producing files like "1699999999-.png" with no name and a
        // collision risk if two files upload in the same millisecond.
        const ext = path.extname(file.originalname);
        const baseName = path
            .basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9_-]/g, "_") // sanitize
            .slice(0, 50); // avoid absurdly long names

        const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
        cb(null, `${baseName}-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb(
            new multer.MulterError(
                "LIMIT_UNEXPECTED_FILE",
                `Unsupported file type: ${file.mimetype}`
            )
        );
    }
    cb(null, true);
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 5, // max number of files per request, adjust as needed
    }
});

// Centralized error-handling middleware for multer.
// Use this AFTER your upload middleware in the route, or as Express
// error-handling middleware (4 args) registered after routes.
export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case "LIMIT_FILE_SIZE":
                return res.status(400).json({
                    error: `File too large. Max size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
                });
            case "LIMIT_FILE_COUNT":
                return res.status(400).json({
                    error: "Too many files uploaded."
                });
            case "LIMIT_UNEXPECTED_FILE":
                return res.status(400).json({
                    error: err.message || "Unexpected or unsupported file."
                });
            default:
                return res.status(400).json({
                    error: `Upload error: ${err.message}`
                });
        }
    } else if (err) {
        // Non-multer errors (e.g. thrown from fileFilter or elsewhere)
        return res.status(500).json({
            error: "An unexpected error occurred during upload."
        });
    }
    next();
};