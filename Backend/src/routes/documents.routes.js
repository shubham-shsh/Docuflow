import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  documentUpload,
  getMyDocuments,
  getSingleDocument,
  deleteDocument,
  shareDocument,
  getAllSharedWithMe,
  getSingleSharedWithMe
} from "../controllers/document.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Create document
router
  .route("/create")
  .post(
    verifyJWT,
    upload.fields([{name : "document"}]),
    documentUpload
  );

// My documents
router
  .route("/my-documents")
  .get(verifyJWT, getMyDocuments);

// Single document (my own)
router
  .route("/document/:docId")
  .get(verifyJWT, getSingleDocument);

// Delete document
router
  .route("/delete/:docId")
  .delete(verifyJWT, deleteDocument);

// Share document
router
  .route("/share/:docId")
  .post(verifyJWT, shareDocument);

// All documents shared with me
router
  .route("/shared-me")
  .get(verifyJWT, getAllSharedWithMe);

// Get one shared-with-me document
router
  .route("/share-me/:docId")
  .get(verifyJWT, getSingleSharedWithMe);

export default router;
