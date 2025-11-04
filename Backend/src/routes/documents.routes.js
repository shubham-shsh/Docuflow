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

// In your document routes
router.get("/pdf/:docId", verifyJWT, async (req, res) => {
  try {
    const { docId } = req.params;
    
    // Get document and verify permissions (same as getSingleDocument logic)
    const document = await Document.findById(docId);
    
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    const isOwner = document.uploadedBy.toString() === req.user._id.toString();
    const isShared = document.sharedWith.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (!isOwner && !isShared) {
      return res.status(403).json({ error: "Permission denied" });
    }

    // Proxy the PDF
    const axios = require('axios');
    const pdfResponse = await axios.get(document.fileUrl, {
      responseType: 'stream'
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    pdfResponse.data.pipe(res);

  } catch (error) {
    res.status(500).json({ error: "Failed to load PDF" });
  }
});


export default router;
