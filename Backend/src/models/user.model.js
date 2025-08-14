import {mongoose, Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import validator from "email-validator";
// ...




const userSchema = new Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: [validator.validate, "Invalid email"],
    },
    fullName :{
      type : String,
      required : true,
      trim : true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    refreshToken : {
        type: String,
    },

    avatar: {
      type : String,
      required : false
    },

    uploadedDocuments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],

},{timestamps : true})


userSchema.pre("save" , async function(next){
    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password,10);
})

userSchema.methods.isPasswordCorrect = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
}

userSchema.methods.generateAccessToken = async function(){
    return jwt.sign(
        {
            _id : this._id,
            email : this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema);
