import multer from "multer";

// Vercel pe disk writable nahi hai, is liye file RAM (req.file.buffer) mein rakhte hain
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
];

// Vercel ki request body limit ~4.5MB hai, is liye 4MB rakha hai
const MAX_FILE_SIZE = 4 * 1024 * 1024;

const fileFilter = (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        const error = new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname);
        error.message = `Unsupported file type: ${file.mimetype}`;
        return cb(error);
    }
    cb(null, true);
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 5,
    },
});

export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case "LIMIT_FILE_SIZE":
                return res.status(400).json({
                    error: `File too large. Max size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
                });
            case "LIMIT_FILE_COUNT":
                return res.status(400).json({
                    error: "Too many files uploaded.",
                });
            case "LIMIT_UNEXPECTED_FILE":
                return res.status(400).json({
                    error: err.message || "Unexpected or unsupported file.",
                });
            default:
                return res.status(400).json({
                    error: `Upload error: ${err.message}`,
                });
        }
    } else if (err) {
        return res.status(500).json({
            error: "An unexpected error occurred during upload.",
        });
    }
    next();
};