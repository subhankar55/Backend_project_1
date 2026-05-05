import mongoose from "mongoose";
import { DB_NAME } from "./constants";

import express from "express";
const app = express();


(async()=>{
    try{
        await mongoose.connect(`mongodb://127.0.0.1:27017/${DB_NAME}`)
        app.on("error",() => {
            console.log("ERROR: ",error);
            throw error;
        })
    }catch(error){
        console.log("ERROR:",error)
        throw error
    }
})();

