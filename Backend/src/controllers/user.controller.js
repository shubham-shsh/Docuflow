import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import validator from "email-validator"

const generateAccesAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = await user.generateAccessToken(); 
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "something went wrong while generating tokens");
  }
};

// const registerUser = asyncHandler(async (req, res) => {
//   const { username, email, password } = req.body;

//   if ([username, email, password].some((field) => field?.trim() === "")) {
//     throw new ApiError(400, "All fields are required");
//   }

//   if(!validator.validate(email)){
//     throw new ApiError(400,"email you entered is not in correct format")
//   }

//   const existedUser = await User.findOne({
//     $or: [{ username }, { email }],
//   });

//   if (existedUser) {
//     throw new ApiError(400, "User with email or username already exists");
//   }

//   //  const avatarLocalPath = req.files?.avatar?.[0]?.path;

//   //   if (!avatarLocalPath) {
//   //     throw new ApiError(400, "Avatar file is required");
//   //   }


//   if (req.files?.avatar?.length > 0) {
//     const avatarLocalPath = req.files.avatar[0].path;
//   }


//   const avatar = await uploadOnCloudinary(avatarLocalPath);

//   if (!avatar) {
//     throw new ApiError(400, "Avatar file is required");
//   }

//   const user = await User.create({
//     username: username.toLowerCase(),
//     email,
//     password,
//     avatar: avatar.url,
//   });

//   const createdUser = await User.findById(user._id).select("-refreshToken");

//   if (!createdUser) {
//     throw new ApiError(500, "Something went wrong while registering user");
//   }

//   return res
//     .status(201)
//     .json(new ApiResponse(201, createdUser, "User registered successfully"));
// });


const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password,fullName } = req.body;

  if ([username, email, password, fullName].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  if (!validator.validate(email)) {
    throw new ApiError(400, "Email you entered is not in correct format");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(400, "User with email or username already exists");
  }

  let avatarUrl = null;

  if (req.files?.avatar?.length > 0) {
    const avatarLocalPath = req.files.avatar[0].path;
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
      throw new ApiError(400, "Failed to upload avatar");
    }
    avatarUrl = avatar.url;
  }

  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatarUrl, 
  });

  const createdUser = await User.findById(user._id).select("-refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});



const getUser = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user || null,
    message: 'current user fetched successfully'
  });
});

const loginUser = asyncHandler(async (req, res) => {
  console.log("func_calling")
  const { username, password } = req.body;
  console.log(username)

  if (!(username && password)) {
    throw new ApiError(400, "Both username and password are required");
  }

  const user = await User.findOne({ username }).select("+password");;

  if (!user) {
    throw new ApiError(400, "User does not exist");
  }

  const isCorrect = await user.isPasswordCorrect(password);

  if (!isCorrect) {
    throw new ApiError(400, "Password you entered is wrong");
  }

  const { accessToken, refreshToken } = await generateAccesAndRefereshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken :undefined
            }
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged Out successfully"))
})

const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorised request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401 , "Refresh token is expired or used")
        }
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        const {accessToken, newRefreshToken } = await generateAccesAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken,options)
        .cookie("refreshToken", newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken:newRefreshToken},
                "Access token refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh Token")
    }
})

const changeCurrentPassword = asyncHandler(async(req,res) => {
  const {oldPassword, confirmPassword,newPassword} = req.body
  
  if(confirmPassword !== newPassword){
    throw new ApiError(400,"confirmPassword is not same as newPassword")
  }

  const user = await User.findById(req.user?._id).select("+password")
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
    throw new ApiError(400,"Invalid old password")
  }

  user.password = newPassword
  await user.save({validateBeforeSave : false})

  return res
  .status(200)
  .json(new ApiResponse(200,{},"password changed successfully"))
  
})

const updateAccountDetails = asyncHandler(async(req,res) => {
    const {fullName,email} = req.body

    if(!fullName &&  !email){
        throw new ApiError(400,"updation field are required")
    }

    if(email && !validator.validate(email)){
      throw new ApiError("401","email you entered is not consistent")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                // fullname : fullname or
                fullName,
                email
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfuly"))
})

// const upadteUserAvatar = asyncHandler(async(req,res) => {

//   const avatarLocalPath = req.files?.path

//   if(!avatarLocalPath){
//     throw new ApiError(400,"avatar field is required")
//   }

//   const avatar = await uploadOnCloudinary(avatarLocalPath)

//   if(!avatar.url){
//     throw new ApiError(400,"error while uploading avatar")
//   }

//   const user = User.findByIdAndUpdate(
//     req.user?._id,
//     {
//       $set : {
//         avatar : avatar.url
//       }
//     },
//     {new :true}
//   )

//   return res
//   .status(200)
//   .json(
//     new ApiResponse(200,user,"avatar updated successfully")
//   )

// })

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.files?.avatar?.[0]?.path;


  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar field is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading avatar");
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.avatar = avatar.url;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

export {
  registerUser,
  loginUser,
  getUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateAccountDetails,
  updateUserAvatar
};

