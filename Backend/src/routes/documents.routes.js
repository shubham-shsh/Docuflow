import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  documentUpload,
  getMyDocuments,
  getSingleDocument,
  viewDocument,
  deleteDocument,
  shareDocument,
  getAllSharedWithMe,
  getSingleSharedWithMe,
  streamPDF,
  updateDocumentAliases
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
  .route("/view/:docId")
  .get(verifyJWT, getSingleDocument);

router
  .route("/my-documents/:docId/view")
  .get(verifyJWT, viewDocument);


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

// to view document
router.route("/pdf/:docId").get(verifyJWT, streamPDF);

router.route("/:docId/aliases").post(verifyJWT, updateDocumentAliases);





export default router;







