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


 
  // console.log("req files: ",req.files); 
  /*req files:  [Object: null prototype] {
  avatar: [
    {
      fieldname: 'avatar',
      originalname: 'Screenshot From 2025-06-06 10-20-15.png',
      encoding: '7bit',
      mimetype: 'image/png',
      destination: './public/temp',
      filename: 'Screenshot From 2025-06-06 10-20-15.png',
      path: 'public/temp/Screenshot From 2025-06-06 10-20-15.png',
      size: 4906
    }
  ],
  coverimage: [
    {
      fieldname: 'coverimage',
      originalname: 'Screenshot From 2025-03-18 22-33-46.png',
      encoding: '7bit',
      mimetype: 'image/png',
      destination: './public/temp',
      filename: 'Screenshot From 2025-03-18 22-33-46.png',
      path: 'public/temp/Screenshot From 2025-03-18 22-33-46.png',
      size: 28844
    }
  ]
}
*/
   //                             STEP1 

 const {fullname,email,username,password} = req.body
 // we can get the data using req.body if it is sent to the server in form of json or from form data
 // to get files like photos,pdfs etc, we injected middleware mutler in the user router
  //  console.log("email: ",email); 


  // console.log("req.body:", req.body);
  /* req.body: [Object: null prototype] {
  fullname: 'dakshhh',
  password: 'dakshrohittt',
  username: 'mysticmaccc',
  email: 'daksh@gmail.comm'
} */

  
   // STEP 2
// console.log("Incoming files: ", req.files); -> what files are to be uploaded on local server
// console.log("Multer field: ", req.files?.avatar); // what files are uploaded succesfully in multer(disk space)


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
   const existeduser= await User.findOne({
    $or:[{ username },{ email }]
   }) // returns the first user present in the db whose either username or email matches with the provided details
   // so you cant add a user whose email  matches with some already present user data in the db
   // or  you cant add a user whose username  matches with some already present user data in the db

    if (existeduser) {
      throw new ApiError(409,"user with email or username already exists")
      
    }

    //step 4 -> to check for files
    const avatarlocalpath=req.files?.avatar[0]?.path;
                // since we have already declared to give us the filepath in mutler middleware, we can get the path (localpath) this way
    // const coverimagelocalpath=req.files?.coverimage[0]?.path;  // this is giving errors because we have not set this to be required in data model, so when user doesnt gives it, it will show an error : TypeError: Cannot read properties of undefined (reading &#39;0&#39;)<br> &nbsp; &nbsp;at file:///home/dakshrohit/Documents/CODE/WEBDEV/node+express+nextjs/xcumyt/src/controllers/user.controller.js:135:52<br> &nbsp; &nbsp;at process.processTicksAndRejections (node:internal/process/task_queues:105:5)</pre>
                                                                   // so we have to check first if it exists or not and should do this operation only if it exists
    let coverimagelocalpath;
    if(req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length>0){
      // three conditions must be satisfied : req.files should exist, req.files.coverimage must be an array, the length of this coverimage array must be more than 0

      coverimagelocalpath=req.files.coverimage[0].path;
    }
    
    if(!avatarlocalpath){
      throw new ApiError(400,"Avatar file is required");
    }

    // step5 

    const avatar= await uploadoncloudinary(avatarlocalpath) // saves on cloudinary and gives back a response
    const coverimage=await uploadoncloudinary(coverimagelocalpath)
    
           // check for avatar again
    if(!avatar){
      throw new ApiError(400,"Avatar file is required")
    }
    
    // step6

    const user= await User.create({
      fullname,
      email,  // email:email , email both are same in modern javascript
      avatar: avatar.url, //already checked that it is existing 100% and is not empty
      coverimage:coverimage?.url || "", // dont know if it exists or not...so check if it exists and assign if it does otherwise assign an empty string 
      password,
      username:username.toLowerCase()
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


/* 
                   // user value :

{   
    "statusCode": 200,
    "data": {
        "_id": "68487af96c31a00718391b97",
        "username": "mysticmac",
        "email": "daksh@gmail.com",
        "fullname": "daksh",
        "avatar": "http://res.cloudinary.com/dfghey3ef/image/upload/v1749580535/zc5pkow9bb0ms2ild4bs.png",
        "coverimage": "http://res.cloudinary.com/dfghey3ef/image/upload/v1749580536/wasmma1leigrdlm15mrj.png",
        "watchhistory": [],
        "createdAt": "2025-06-10T18:35:37.810Z",
        "updatedAt": "2025-06-10T18:35:37.810Z",
        "__v": 0
    },
    "message": "User registered successfully",
    "success": true
} 

    */
// this is the message recieved once we send data via postman to database -> is nothing but user we created in step 6 
// /home/dakshrohit/Pictures/Screenshots/Screenshot From 2025-06-11 00-06-48.png  -> image of how data is sent to test using postman

// but why are we using cloudinary ?

// so that we can give frontend the url of the files to show it 

// how to get the frontend ?
// look at the response we recieved in postman after sending data, there you could find urls of both avatar and coverimg and notice both of thier names are different even though we have set up those to be the same name which user uploads, that is because cloudinary does few things to it.
// http://res.cloudinary.com/dfghey3ef/image/upload/v1749580535/zc5pkow9bb0ms2ild4bs.png for ex -> you can directly paste this on google to get the image and this url can be used to show on frontend
// you can also look these things in db :  /home/dakshrohit/Pictures/Screenshots/Screenshot From 2025-06-11 00-18-14.png