import multer from "multer";
import path from "path";
import fs from "fs";
import mime from "mime-types";

// Ensure upload directories exist
const uploadDirs = {
  images: path.join(process.cwd(), "uploads", "images"),
  videos: path.join(process.cwd(), "uploads", "videos"),
  audio: path.join(process.cwd(), "uploads", "audio"),
  files: path.join(process.cwd(), "uploads", "files"),
};

// Create directories if they don't exist
Object.values(uploadDirs).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Define file type mappings
const getFileCategory = (mimetype: string): keyof typeof uploadDirs => {
  if (mimetype.startsWith("image/")) return "images";
  if (mimetype.startsWith("video/")) return "videos";
  if (mimetype.startsWith("audio/")) return "audio";
  return "files";
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = getFileCategory(file.mimetype);
    cb(null, uploadDirs[category]);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter for security
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allowed file types
  const allowedTypes = [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    // Videos
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/webm",
    // Audio
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    "audio/aac",
    "audio/webm",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "application/zip",
    "application/x-zip-compressed",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`));
  }
};

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 1, // Single file upload
  },
});

// Helper function to get file URL
export const getFileUrl = (
  filename: string,
  category: keyof typeof uploadDirs
): string => {
  return `/api/media/files/${category}/${filename}`;
};

// Helper function to get file path
export const getFilePath = (
  filename: string,
  category: keyof typeof uploadDirs
): string => {
  return path.join(uploadDirs[category], filename);
};

// Helper function to delete file
export const deleteFile = (
  filename: string,
  category: keyof typeof uploadDirs
): boolean => {
  try {
    const filePath = getFilePath(filename, category);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};

export { uploadDirs, getFileCategory };
