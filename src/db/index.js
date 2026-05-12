import mongoose from "mongoose"
import {DB_NAME} from "../constants.js"

// DB connection

const connectDB = async () => {
    try{
        const dbconnection = await mongoose.connect(`mongodb://127.0.0.1:27017/${DB_NAME}`);
        console.log(`\n MongoDB connected !! DB HOST: ${dbconnection.connection.host}`)
    }
    catch(error){
        console.log("MONGODB connection Failed",error.message);
        process.exit(1);
    }
}
export default connectDB;