import {mongoose, Schema} from "mongoose";

const DocumentSchema = new Schema({
    title : {
        type : String,
        required : true,
        trim : true
    },

    uploadedBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },

    originalName: { 
      type: String,
      required: false,
    },
    
    mimetype: { 
      type: String,
      required: false,
    },
    sharedWith : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
        }
    ],
    fileUrl : {
        type : String,
        required : true
    },
    shareExpiration: {
        type: Date,
        default: null,
    },
    hash : {
        type : String,
        default : null
    },
    aliases : {
        type : [String],
        default : []
    },
    tags : {
        type : [String],
        default : []
    },
    mediaId: { 
        type: String,
        default: null 
    },      // WhatsApp media_id
    mediaMime: { 
        type: String,
        default: null 
    },    // MIME type at upload time
    lastSentAt: { 
        type: Date,
        default: null
    }

    
},{timestamps : true})

DocumentSchema.index({ sharedWith: 1 })

export const Document = mongoose.model("Document" ,DocumentSchema)