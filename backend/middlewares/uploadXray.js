import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDirectory = path.resolve(__dirname, "../uploads");
fs.mkdirSync(uploadsDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDirectory,
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${crypto.randomUUID()}${extension}`);
  },
});

const imageFilter = (_req, file, callback) => {
  if (["image/jpeg", "image/png"].includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "image"));
  }
};

export const uploadXray = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
});
