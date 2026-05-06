import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";

import dotenv from "dotenv";
dotenv.config();

// import express from "express";
// const app = express();


// (async()=>{
//     try{
//         await mongoose.connect(`mongodb://127.0.0.1:27017/${DB_NAME}`)
//         app.on("error",() => {
//             console.log("ERROR: ",error);
//             throw error;
//         })
//         app.listen(process.env.PORT,() => {
//             console.log(`App is listening on port ${process.env.PORT}`);
//         })
//     }catch(error){
//         console.log("ERROR:",error)
//         throw error
//     }
// })();

import connectDB from "./db/index.js";
import app from "./app.js";

connectDB()
.then(() => {
    app.listen(process.env.PORT || 3000,()=> {
        console.log(`App is listening on port ${process.env.PORT}`);
    
    })
})
.catch((error)=>{
    console.log("MONGO_DB connection failed !!!",error);
})