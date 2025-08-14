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
    }

    
},{timestamps : true})

DocumentSchema.index({ sharedWith: 1 })

export const Document = mongoose.model("Document" ,DocumentSchema)