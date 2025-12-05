import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import mime from "mime-types";
import {
  getFileCategory,
  getFileUrl,
  getFilePath,
  deleteFile,
} from "../config/multer";
import { Message } from "../model/messages";

interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: any;
}

/**
 * Upload file
 * POST /api/media/upload
 */
export const uploadFile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { file } = req;
    const category = getFileCategory(file.mimetype);
    const fileUrl = getFileUrl(file.filename, category);

    // Create file metadata
    const fileData = {
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      category,
      url: fileUrl,
      uploadedBy: req.user!._id,
      uploadedAt: new Date(),
    };

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: fileData,
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload file",
      error: error.message,
    });
  }
};

/**
 * Serve file
 * GET /api/media/files/:category/:filename
 */
export const serveFile = async (req: Request, res: Response) => {
  try {
    const { category, filename } = req.params;

    // Validate category
    const validCategories = ["images", "videos", "audio", "files"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file category",
      });
    }

    const filePath = getFilePath(filename, category as any);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const mimeType = mime.lookup(filePath) || "application/octet-stream";

    // Set headers
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Length", stats.size);
    res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 year cache

    // For images and videos, allow inline display
    if (mimeType.startsWith("image/") || mimeType.startsWith("video/")) {
      res.setHeader("Content-Disposition", "inline");
    } else {
      // For other files, suggest download
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${path.basename(filePath)}"`
      );
    }

    // Stream file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error: any) {
    console.error("Error serving file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to serve file",
      error: error.message,
    });
  }
};

/**
 * Delete file
 * DELETE /api/media/files/:category/:filename
 */
export const deleteUploadedFile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { category, filename } = req.params;

    // Validate category
    const validCategories = ["images", "videos", "audio", "files"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file category",
      });
    }

    // Check if file is being used in any messages
    const fileUrl = getFileUrl(filename, category as any);
    const messageUsingFile = await Message.findOne({ mediaUrl: fileUrl });

    if (messageUsingFile) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete file - it is being used in messages",
      });
    }

    // Delete the file
    const deleted = deleteFile(filename, category as any);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "File not found or could not be deleted",
      });
    }

    res.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete file",
      error: error.message,
    });
  }
};

/**
 * Get file info
 * GET /api/media/info/:category/:filename
 */
export const getFileInfo = async (req: Request, res: Response) => {
  try {
    const { category, filename } = req.params;

    // Validate category
    const validCategories = ["images", "videos", "audio", "files"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file category",
      });
    }

    const filePath = getFilePath(filename, category as any);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const mimeType = mime.lookup(filePath) || "application/octet-stream";

    const fileInfo = {
      filename,
      category,
      mimetype: mimeType,
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      url: getFileUrl(filename, category as any),
    };

    res.json({
      success: true,
      data: fileInfo,
    });
  } catch (error: any) {
    console.error("Error getting file info:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get file info",
      error: error.message,
    });
  }
};
