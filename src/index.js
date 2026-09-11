
// approch 1 of connecting database, all code in index.js
/*
import mongoose from "mongoose";
import { DB_NAME} from "./constants.js";
import express from "express";
import 'dotenv/config';

const app=express();

//iifs
;(async ()=>{
    try {
        await mongoose.connect(`${process.env.MongoDB_URI}/${DB_NAME}`);
        app.on("error",(error)=>{
            console.log("ERROR: ",error);
            throw error;
        })
        app.listen(process.env.PORT,()=>{
            console.log(`APP is listening on port ${process.env.PORT}`);
        })
    }
    catch(error){
        console.error("ERROR: ",error);
        throw error;
        }
})()
*/

//2nd approch
import connectDB from "./db/index.js";
import 'dotenv/config';

connectDB()



