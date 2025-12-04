import express from "express";
import { authenticateToken } from "../middleware/auth";
import { upload } from "../config/multer";
import {
  uploadFile,
  serveFile,
  deleteUploadedFile,
  getFileInfo,
} from "../controller/mediaController";
import { mediaUploadRateLimit } from "../middleware/security";

const router = express.Router();

/**
 * @route POST /api/media/upload
 * @desc Upload a file (image, video, audio, or document)
 * @access Private
 */
router.post(
  "/upload",
  mediaUploadRateLimit,
  authenticateToken,
  upload.single("file"),
  uploadFile
);

/**
 * @route GET /api/media/files/:category/:filename
 * @desc Serve/download a file
 * @access Public (files are served directly)
 */
router.get("/files/:category/:filename", serveFile);

/**
 * @route GET /api/media/info/:category/:filename
 * @desc Get file information
 * @access Public
 */
router.get("/info/:category/:filename", getFileInfo);

/**
 * @route DELETE /api/media/files/:category/:filename
 * @desc Delete a file (only if not used in messages)
 * @access Private
 */
router.delete(
  "/files/:category/:filename",
  authenticateToken,
  deleteUploadedFile
);

export default router;
