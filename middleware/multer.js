import multer from "multer";

// Allowed mime types
const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Store uploaded files in memory instead of local disk.
// This works with Vercel/serverless environments.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb(
            new multer.MulterError(
                "LIMIT_UNEXPECTED_FILE"
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
        files: 5,
    },
});

// Centralized Multer error handler
export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case "LIMIT_FILE_SIZE":
                return res.status(400).json({
                    success: false,
                    error: `File too large. Max size is ${
                        MAX_FILE_SIZE / (1024 * 1024)
                    }MB.`,
                });

            case "LIMIT_FILE_COUNT":
                return res.status(400).json({
                    success: false,
                    error: "Too many files uploaded.",
                });

            case "LIMIT_UNEXPECTED_FILE":
                return res.status(400).json({
                    success: false,
                    error: "Unsupported file type.",
                });

            default:
                return res.status(400).json({
                    success: false,
                    error: `Upload error: ${err.message}`,
                });
        }
    }

    if (err) {
        console.error("Upload error:", err);

        return res.status(500).json({
            success: false,
            error: "An unexpected error occurred during upload.",
        });
    }

    next();
};