//vid9
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app= express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}
))

app.use(express.json({limit:"16kb"})) // mddleware to accept json 

app.use(express.urlencoded({extended:true,limit:"16kb"}));// for url data
app.use(express.static("public"))// public assest for image and other storage public folder

//now cookies
app.use(cookieParser());


//now routes
import userRouter from './routes/user.router.js'

//route declaration
app.use("/api/v1/users",userRouter);


export { app }