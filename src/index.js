import {app} from "./app.js"
// import { configDotenv } from "dotenv";

// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
dotenv.config({
    path:'./env'
})


// WE ARE DOING THIS BECAUSE WE WANT TO ENV FILE TO LOAD ASAP SO THAT ALL THE FILES GET THE ENV VARIABLES WHICH THEY REQUIRE
// and we can do this using two methods one by require and another by importing it.





// import mongoose from "mongoose";
// import { DB_NAME } from "./constants.js";
// import connectdb from connectdb;
import connectdb from "./db/index.js";


connectdb() // this is the second approach to setup database connection, by creating a new file and writing the connection code there
.then(()=>{ // this will be executed if promise is recieved successfully

     // always listen for errors before listening to the port i.e before app.listen
    app.on("error",(error)=>{
            console.error("ERRR: ",error);
            throw error;
            
        })

    app.listen(process.env.PORT || 8000 ,()=>{
        console.log(`Server is running at port : ${process.env.PORT}.`);
        
    })

})
.catch((err)=>{ // executed if promise is not recieved successfully
    console.log("MONGODB connection failed!!!",err);
    
}

)


/* whenever an asynchronous methods gets completed, a promise is returned always
A Promise represents a value that may be available now, later, or never. It has three states:

Pending (not yet resolved)

Fulfilled (resolved successfully)

Rejected (failed)

.then() -> executes on success
.catch()-> runs on failures

*/














/*
                   FIRST APPROACH OF CONNECTION WITH DATABASE
import express from "express";
const app = express();

( async() => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);  // mongoose.connect() : ongoose's method to connect to a MongoDB database, Returns a Promise that resolves when the connection is established
           // process.env.MONGODB_URL : Accesses an environment variable containing the base MongoDB connection URL
           //${DB_NAME} : A variable containing the name of the specific database you want to connect to
        //    Combines the base URL and database name into a complete connection string
        // await: aits for the connection to be established before proceeding Must be used inside an async function


       // always listen to errors before listening for port i.e before app.listen,
        app.on("error",(error)=>{
            console.error("ERRR: ",error);
            throw error;
            
        })

        //app.on("error", ...) : sets up an event listener for the "error" event,istens for 'error' events emitted by the Express app
//(error) => { ... } : The callback function that will execute when an error occurs, The error object is passed as the first parameter
//console.error("APP ERROR:", error) ,Logs the error to stderr (standard error output)
//he full error object is printed, including stack trace
// throw error: Re-throws the error after logging it,The throw error will terminate your Node.js process

// this whole part catches errors which are thrown in try, catch segments.
// example :will catch  : app.emit('error', err); // Manually emit error, this would be written inside some catch




        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`);
            
        })
    }
    catch (error){
        console.error("ERROR: ",error);
        throw error;
    }
} )()

*/