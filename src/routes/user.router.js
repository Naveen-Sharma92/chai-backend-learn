import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middlewares.js"
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
//router.route("/login").post(login)

export default router