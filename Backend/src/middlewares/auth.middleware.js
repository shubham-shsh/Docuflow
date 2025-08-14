import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

// const verifyJWT = asyncHandler(async(req,res,next) => {
//     try {
//         const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
//         console.log("check")
//         if(!token){
//             throw new ApiError(401, "Unauthorised request")
//         }
        
//         const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
//         const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
            
//         if(!user){
//             throw new ApiError(401,"Invalid Access Token")
//         }
    
//         req.user = user;
//         next()
//     } catch (error) {
//         throw new ApiError(500 ,"error in verifying token")
//     }
// })


const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    console.log("check");
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }
    console.log("Token received:", token);
    console.log("Type of token:", typeof token);

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select("-refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);  // Log the exact error
    // You can also check for specific JWT errors here:
    if (error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Access token expired"));
    } else if (error.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Invalid access token"));
    }
    next(new ApiError(500, "Error in verifying token"));
  }
});


export {verifyJWT}