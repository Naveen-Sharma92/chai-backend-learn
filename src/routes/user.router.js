import { Router } from "express";
import { registerUser } from "../controllers/user.controllers";

const router=Router()


//when someone app.js route here using app.user(""/api/v1/users"",userRouter)

router.route("/register").post(registerUser)
router.route("/login").post(login)

export default router