import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectdb = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`) // gives a return object
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
        
        
    } catch (error) {
        console.log("MONGODB connection FAILED",error); // error -> shows the complete error
        process.exit(1); //just a method to exit this process of nodejs
    }
}


export default connectdb;