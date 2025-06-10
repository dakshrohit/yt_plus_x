import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from '../utils/ApiError.js'
import {User} from "../models/user.models.js"
import {uploadoncloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
// asyncHandler(...)
// This is a middleware wrapper commonly used in Express apps — especially when dealing with async/await.
/*  Without asyncHandler, you’d have to write:
app.post('/register', async (req, res, next) => {
  try {
    // logic here
  } catch (error) {
    next(error);
  }
}); */

// method to register user
const registeruser= asyncHandler(async (req,res)=>{
  /*   AN EXAMPLE TO UNDERSTAND ROUTING,CONTROLLERS AND TO CHECK IF JSON DATA IS GOING OR NOT UISNG POSTMAN
     res.status(200).json({
        message:"okk"

    })
    //res.status(200) :- 
// This sets the HTTP status code to 200 (OK).
// Returns the res object itself (not a new object) which makes the chaning possible.
// .json({ message: "ok" }) :-

// This sends a JSON response to the client.
// Also ends the response (i.e., the request-response cycle is complete).
//You're chaining: res.status(200) → returns res → .json(...) on the same object
// check you are getting the json data or not using the postman, enter the url and send
*/

// REAL LOGIC TO GET USER REGISTERED 

               // STEPS //


  // GET USER DETAILS FROM FRONTEND ACCORDING TO THE USER MODEL THAT WE WROTE
  // VALIDATION OF THE DETAILS THAT IS IF THEY ARE CONNECT OR NOT, CHECK IF ALL ARE EMPTY 
  // CHECK IS USER ALREADY EXISTS : USING USERNAME, EMAIL
  // CHECK FOR IMAGES AVATAR AND COVERIMAGES, (AS WE ARE TAKING TWO IMAGES FROM THE USER ), CHECK FOR AVATAR AS IT IS COMPULSORY
  // UPLOAD THEM TO CLOUDINARY USING THE CLOUDINARY.JS , CHECK FOR AVATAR again
  // CREATE USER OBJECT -> CREATE ENTRY IN DB
  // REMOVE PASSWORD AND REFRESH TOKEN FIELD FROM RESPONSE -> TO GIVE THE NON-ENCRYPTED PASSWORD TO THE FRONTEND TO SHOW THE USER
  // CHECK USER CREATION BY CHECKING THE RESPONSE
  // RETURN RESPONSE IF IT CAME OR SEND ERROR



  // STEP1 

 const {fullname,email,username,password} = req.body
 // we can get the data using req.body if it is sent to the server in form of json or from form data
 // to get files like photos,pdfs etc, we injected middleware mutler in the user router
   console.log("email: ",email); 
  
   // STEP 2

   if (fullname==="") {
    throw new ApiError(400,"fullname is required");

    
   } // like this we can validate/check each thing

   // if we have to check all things at once

   if (
     [fullname,email,username,password].some((field)=>{
      return field?.trim() === "" //checks if a field is:
      // Falsy (null/undefined-safe with ?.)
     // An empty string (after trimming spaces)
     }) //.some() returns true if any item in the array meets the condition.
   ) {
     throw new ApiError(400,"All fields are required")
   }
   
   // step 3
   const existeduser= User.findOne({
    $or:[{ username },{ email }]
   }) // returns the first user present in the db whose either username or email matches with the provided details
   // so you cant add a user whose email  matches with some already present user data in the db
   // or  you cant add a user whose username  matches with some already present user data in the db

    if (existeduser) {
      throw new ApiError(409,"user with email or username already exists")
      
    }

    //step 4 -> to check for files
    const avatarlocalpath=req.files?.avatar[0]?.path
                // since we have already declared to give us the filepath in mutler middleware, we can get the path (localpath) this way
    const coverimahelocalpath=req.files?.coverimage[0]?.path;
    
    if(!avatarlocalpath){
      throw new ApiError(400,"Avatar file is required");
    }

    // step5 

    const avatar= await uploadoncloudinary(avatarlocalpath) // saves on cloudinary and gives back a response
    const coverimage=await uploadoncloudinary(coverimahelocalpath)
    
           // check for avatar again
    if(!avatar){
      throw new ApiError(400,"Avatar file is required")
    }
    
    // step6

    const user= await User.create({
      fullname,
      avatar: avatar.url, //already checked that it is existing 100% and is not empty
      coverimage:coverimage?.url || "", // dont know if it exists or not...so check if it exists and assign if it does otherwise assign an empty string 
      password,
      username:username.toLowercase()
    })


     // step 7
  
    const createduser = await User.findById(user._id).select(
      "-password -refreshtoken"
    )

          /* await User.findById(user._id)

                   Finds a user document from the MongoDB collection using its _id.

                    user._id must be a valid MongoDB ObjectId (e.g., from a newly created or authenticated user).

                    .select("-password -refreshtoken")

                    tells Mongoose to exclude the password and refreshtoken fields from the result.

                    The - sign means "do not include" those fields in the returned object. 
                     You generally don’t want to send sensitive information like:

                                    password (even if hashed)

                             refreshtoken (used for session renewal)

                                     ...back to the client (like frontend or API consumers).


*/                          
    // step 8
    if(!createduser){
      throw new ApiError(500,"Something went wrong while registering the user")
    }
  
     // step 9
          // first we have to make the response in a proper format in order to return it
          // return res.status(201).json({createduser}) // works, but not in a good order
          return res.status(201).json(
            new ApiResponse(200,createduser,"User registered successfully")
          )



})








export {registeruser};