import { Router } from "express";
import {upload} from "../middlewares/multer.middlewares.js"
import { loginUser, 
    logoutUser, 
    registerUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateUserAvatar, 
    updateUserCoverImage, 
    getUserChannelProfile, 
    getWatchHistory, 
    updateAccountDetails } from "../controllers/user.controllers.js";
import {verifyJWT} from "../middlewares/auth.middlewares.js"
const router=Router()


//when someone app.js route here using app.user(""/api/v1/users"",userRouter)

// router.route("/register").post(registerUser) in vid 13
//in vid 14 used multer also
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)



router.route("/login").post(loginUser)

//secure routes
router.route("/logout").post(verifyJWT, logoutUser) //verifyJWT is middleware that need to run from auth.middleware.js so that we have id of currently login user


router.route("/refresh-token").post(refreshAccessToken)


router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)

export default router