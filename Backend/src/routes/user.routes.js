import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js";
import {
  registerUser,
  loginUser,
  getUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateAccountDetails,
  updateUserAvatar
} from "../controllers/user.controller.js";

const router = Router()

router.route("/register").post(
      upload.fields([
        {
          name : "avatar",
          maxcount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
      ]),
      registerUser
)

router.route("/login").post(loginUser)    
router.route("/getUser").get(verifyJWT, getUser)         
router.route("/logout").post(verifyJWT, logoutUser)       
router.route("/change-password").post(verifyJWT, changeCurrentPassword) 
router.route("/refresh-token").post(refreshAccessToken)    
router.route("/update").post(verifyJWT, updateAccountDetails)
router.route("/update_avatar").post(
  verifyJWT,
  upload.fields([{ name: "avatar", maxCount: 1 }]), 
  updateUserAvatar
);


export default router