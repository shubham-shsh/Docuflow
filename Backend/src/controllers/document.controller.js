import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Document } from "../models/document.model.js";
import { User } from "../models/user.model.js";
import {sendEmail} from "../utils/mail.js";

const documentUpload = asyncHandler(async (req, res) => {
  const { title } = req.body;

  if (!title) {
    throw new ApiError(400, "Document title is required");
  }

  const documentLocalPath = req.files?.document?.[0]?.path;
  if (!documentLocalPath) {
    throw new ApiError(400, "Document file is required");
  }

  const docFile = await uploadOnCloudinary(documentLocalPath);
  if (!docFile || !docFile.secure_url) {
    throw new ApiError(400, "Failed to upload document");
  }

  const doc = await Document.create({
    title,
    fileUrl: docFile.secure_url,
    uploadedBy: req.user?._id
  });

  return res
  .status(200)
  .json(new ApiResponse(200,doc,"document uploaded successfully"))
});

const getMyDocuments = asyncHandler(async (req, res) => {
  const documents = await Document.find({uploadedBy : req.user._id})
  .sort({createdAt : -1})

  return res
    .status(200)
    .json(new ApiResponse(200, documents, "Documents fetched successfully"))
})


const getSingleDocument = asyncHandler(async(req,res) =>{
    const {docId} = req.params

    const document = await Document.findOne({
        _id : docId,
        uploadedBy : req.user._id
    })
    if (!document) {
        throw new ApiError(404, "Document not found or access denied");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, document, "Document fetched successfully"));
})

const deleteDocument = asyncHandler(async (req, res) => {
  const { docId } = req.params;

  if (!docId) {
    throw new ApiError(400, "Select document to be deleted");
  }

  const document = await Document.findOneAndDelete({
    _id: docId,
    uploadedBy: req.user._id,
  });

  if (!document) {
    throw new ApiError(404, "Document not found or you do not have permission to delete it");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Document deleted successfully"));
});

const shareDocument = asyncHandler(async(req,res) => {
  const {docId} = req.params
  const {recieverEmail} = req.body

  const document = await Document.findById(docId)

  if(!document){
    throw new ApiError(404, "Document not found");
  }
   
  // console.log("uploadedBy:", document.uploadedBy, typeof document.uploadedBy);
  // console.log("req.user._id:", req.user._id, typeof req.user._id);

  // if(document.uploadedBy.toString() !== req.user._id){
  //   throw new ApiError(400,"you are not allowed to share this document")
  // }

  if (!document.uploadedBy.equals(req.user._id)) {
    throw new ApiError(400, "you are not allowed to share this document");
  }


  const reciever = await User.findOne({ email: recieverEmail });


  if(!reciever){
    throw new ApiError(400,"User with this email not found")
  }

  document.sharedWith.push(reciever._id)
  await document.save()

  await sendEmail({
    to : recieverEmail,
    subject : "📄 A Document Has Been Shared With You",
    html: `
      <h2>Hello ${reciever.fullName},</h2>
      <p><strong>${req.user.fullName}</strong> has shared a document with you on <strong>DocuFlow</strong>.</p>
      <p>Document Title: <strong>${document.title || "Untitled Document"}</strong></p>
      <p><a href="https://your-frontend-url.com/notes/${docId}">Click here to view the document</a></p>
      <br/>
      <p>Thanks,<br/>DocuFlow Team</p>
    `
  })

  return res
  .status(200)
  .json(new ApiResponse(200,null,"Document shared successfull"))
})

const getAllSharedWithMe = asyncHandler(async(req,res) => {
  const documents = await Document.find({
    sharedWith : req.user._id
  })

  if (!documents || documents.length === 0) {
    throw new ApiError(404, "No shared documents available");
  }

  return res
  .status(200)
  .json(new ApiResponse(200,documents,"Shared documents fetched"))
})

const getSingleSharedWithMe = asyncHandler(async(req,res) => {
  const {docId} = req.params

  const document = await Document.findOne({
    _id : docId,
    sharedWith : req.user._id
  })

  if (!document) {
    throw new ApiError(404, "Document not found or not shared with you");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, document, "Shared document fetched successfully"));
})

export {
  documentUpload,
  getMyDocuments,
  getSingleDocument,
  deleteDocument,
  shareDocument,
  getAllSharedWithMe,
  getSingleSharedWithMe
}

