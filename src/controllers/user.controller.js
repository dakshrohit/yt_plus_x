import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from '../utils/ApiError.js'
import {User} from "../models/user.models.js"
import {uploadoncloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const generateaccessandrefreshtokens = async(userid)=>{
  try {
   const user=  await User.findById(userid); // finds user on the basis of userid
   const accesstoken=user.generateAccessToken();
   const refreshtoken=user.generateRefreshToken();
   // so now we have both tokens and both have to be  given to the user
   // also refreshtoken is saved in our db, so that we dont have to ask password multiple times from the user

   user.refreshtokens=refreshtoken; // saved refreshtoken in db (see in user.model, we have a field of refreshtokens)
  //  user.save(); // whenever you save, all the things of user.model kicks in, for ex password,which is a required in our field,and here we have only set one field of refresh token, it would give an error.
  // we willbe specifying -> dont do validation, just save
  await user.save(
    {validateBeforeSave:false}
  ) 
  //  giving back both tokens

  return {accesstoken,refreshtoken}


    
  } catch (error) {
    console.error("Error during token generation:",error);
    throw new ApiError(500,"something went wrong while generating refresh and access tokens")
 
    
    
  }


  // so now we have a method to do all the things written above
}
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
      return !field || field?.trim() === "" 
      
      // "Some" (∃ in logic) means "there exists at least one".
      //checks if a field is:
      // Falsy (null/undefined-safe with ?.)
     // An empty string (after trimming spaces)
     // field catches: null,undefined,Empty string ("")
     // both undefined and null are equal to false(falsy) so taking its negation gives true
      /* field?.trim() === "" catches: Strings with only whitespace (" "),Empty strings (redundant with !field, but harmless)
          he .trim() method in JavaScript removes whitespace (spaces, tabs, newlines) from both ends of a string.for null/undefined,it crashes (gives error), so use optional chaning.
        ?. -> known as optional chaining

 

How .some() Works:

Checks each field one by one (left to right).
Stops immediately if any callback returns true.
Only checks all fields if none return true early.



*/





     }) //.some() returns true if any item in the array meets the condition.
    //  If the arrow function has braces {}, you must write return keyword
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
      fullname, //from req.body
      email,  // email:email , email both are same in modern javascript
      avatar: avatar.url, //already checked that it is existing 100% and is not empty
      coverimage:coverimage?.url || "", // dont know if it exists or not...so check if it exists and assign if it does otherwise assign an empty string 
      password, // Hashed automatically by Mongoose pre-save hook
      username:username.toLowerCase()
    }) 
// User.create() returns a promise : 
    /* {
  _id: new ObjectId("65a1bc2e..."),
  fullname: "John Doe",
  email: "john@example.com",
  avatar: "https://res.cloudinary.com/.../avatar.jpg",
  coverimage: "",
  username: "johndoe",
  password: "$2a$10$hashed...", // Auto-hashed by pre-save hook
  createdAt: ISODate("2024-01-13T10:00:00Z"), // If timestamps enabled
  __v: 0 // Version key (if schema option enabled)
} 
*/


     // step 7
  
    const createduser = await User.findById(user._id).select(
      "-password -refreshtokens"
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

const loginuser=asyncHandler(async(req,res)=>{

  // steps

   // bring data from req.body
   // check username or email is there or not
   // find the user, if its not there, return an error
   // if there is a user, password check
   // if password matches, genrate both types of tokens and update/send the refreshtoken to db of the user that is validated that it exists.
   // and send these tokens to the user in form of cookies (secure cookies) and also send the "user" object data  after login to frontend to display profile,dashboard etc once loggedin


   //step 1

   const {email,username,password} =req.body;

   
   // step 2
   if(!username  && !email) {
    throw new ApiError(400,"Username or email is required")
   } // we need both email and password

  //  alteranate of the above code
  // if(!(username  || email)){
  //   throw new ApiError(400,"Username or email is required")
  //  } // we need any one

   // step3

   const user=await User.findOne({
    $or: [{username},{email}]
    // this operator will find the first matching user either acc to the username or email
   })


   if(!user){
    throw new ApiError(404,"User does not exist")
   }

   //step 4
  const ispasswordvalid= await user.isPasswordCorrect(password);
  if(!ispasswordvalid){
    throw new ApiError(401,"Invalid user credentials")
  }

  //step 5  -> generating both tokens-> this we have to multiple times, so we will generated function to do the same. the func is written above
    
  // using the method we created:
  const {accesstoken,refreshtoken} = await generateaccessandrefreshtokens(user._id); // this method returns both tokens, so we stored them in two variables
  // this method also involves storing the refreshtoken in the db

  // step 6 -> to send these tokens in form of cookies

    // here to update the tokens/ send the tokens, we can either update the user object we got using findone() or can call another database query

    const loggedinuser = await User.findById(user._id).select("-password -refreshtokens"); // ran another query in db to get user object which will have all fields except password and refreshtoken
    /* loggedInUser is the sanitized user object that gets sent back to the frontend as part of the response after a successful login */
    const options ={
      httpOnly:true,
      secure:true
    } 

    //by default, anybody can modify these cookies, be it frontend or backend
    // but after writing the above line, we can only modify cookies by backend or thr server
    

    return res.status(200)
    .cookie("accesstoken",accesstoken,options)
    .cookie("refreshtoken",refreshtoken,options)
    .json(
      new ApiResponse(
        200,
        {
          user :loggedinuser,accesstoken,refreshtoken
        }, // sending both tokens explicitly to the user (even though we have set them already in cookies)
        "User logged in successfully !"
      )
    )





})

const logoutuser= asyncHandler(async(req,res)=>{

         //steps
           // delete the refresh token from the db and clear the cookies which have the tokens
           // also reset the cookies which are there in the user.model.js schema and we did set them using generateaccessandrefershtoken method and we sent both tokens as cookies to the browser during login.

           
               // deleting refresh tokens from the db 
           await User.findByIdAndUpdate(
            req.user._id,
            {
              $unset:{
                refreshtokens:1
              },
             
            },
             {
                new:true
              }
           )

         const options ={
      httpOnly:true,
      secure:true
    } 

    return res.status(200)
    .cookie("accesstoken",options)
    .cookie("refreshtoken",options)
    .json(
      new ApiResponse(
        200,
        {}, 
        "User logged out !"
      )
    )
















})





// why middleware auth.midd.js got created? -> to get to know if the user is authenticated or not
// as it is required for other areas as well so we created a new middleware which could be used wherever it is needed


export {registeruser,loginuser,logoutuser};






















/*  Complete Flow for registration: 



Frontend:

User fills form with text fields and selects images

Form data is converted to multipart/form-data format

Sent to /api/auth/register endpoint

Backend:

Multer middleware processes file uploads to temp storage

Validates required fields

Checks for existing users

Uploads images to Cloudinary

Creates user in MongoDB (password auto-hashed)

Returns sanitized user data (no password/refreshToken)

Database:

New document created with all user data

Example document:

json
{
  "_id": "65a1bc2e...",
  "fullname": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "avatar": "https://res.cloudinary.com/.../avatar.jpg",
  "coverimage": "",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z",
  "__v": 0
}
Frontend Response Handling:

Receives success response with user data

Can immediately log user in or redirect to login page */

/* A. Login Flow
1. User submits credentials
Endpoint: POST /api/auth/login

Request Body:

json
{ "email": "user@example.com", "password": "123456" }
2. Server validates and issues tokens
javascript
// controllers/authController.js
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Check if user exists
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  // 2. Validate password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");

  // 3. Generate tokens
  const { accessToken, refreshToken } = await generateTokens(user._id);

  // 4. Store refreshToken in DB (for validation later)
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // 5. Set HTTP-only cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json({
      success: true,
      user: { _id: user._id, email: user.email, name: user.name },
    });
});
3. Tokens Generated
accessToken: Short-lived (e.g., 15 minutes).

refreshToken: Long-lived (e.g., 7 days), stored in DB.

B. Logout Flow
1. User requests logout
Endpoint: POST /api/auth/logout

Middleware: verifyJWT (checks valid accessToken).

2. Server invalidates tokens
javascript
// controllers/authController.js
const logoutUser = asyncHandler(async (req, res) => {
  // 1. Remove refreshToken from DB
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  // 2. Clear cookies
  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json({ success: true, message: "Logged out" });
});
C. Protecting Routes
Middleware: verifyJWT
javascript
// middleware/authMiddleware.js
const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  if (!token) throw new ApiError(401, "Unauthorized");

  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const user = await User.findById(decodedToken._id).select("-password");

  if (!user) throw new ApiError(401, "Invalid token");
  req.user = user; // Attach user to request
  next();
});
Usage in Routes
javascript
// routes/userRoutes.js
router.get("/profile", verifyJWT, (req, res) => {
  res.json(req.user); // Only accessible with valid token
});
2. Frontend Setup (React/Next.js)
A. Login Flow
1. User submits form
javascript
// LoginForm.jsx
const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include", // Required for cookies
    });
    const data = await res.json();
    if (data.success) {
      // Store user in context/state
      setUser(data.user);
      redirect("/dashboard");
    }
  } catch (err) {
    alert("Login failed");
  }
};
2. Store user in state (e.g., React Context)
javascript
// AuthContext.jsx
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => setUser(userData);
  const logout = async () => {
    await fetch("/api/auth/logout", { credentials: "include" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
B. Logout Flow
javascript
// Navbar.jsx
const { logout } = useContext(AuthContext);

const handleLogout = async () => {
  await logout();
  window.location.href = "/login"; // Redirect
};
C. Protected Routes (Frontend)
javascript
// ProtectedRoute.jsx
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user]);

  return user ? children : null;
};
3. Token Refresh Flow (Optional)
Backend: Refresh Token Endpoint
javascript
// controllers/authController.js
const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) throw new ApiError(401, "Unauthorized");

  const user = await User.findOne({ refreshToken });
  if (!user) throw new ApiError(401, "Invalid refresh token");

  const newAccessToken = jwt.sign(
    { _id: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  res
    .cookie("accessToken", newAccessToken, { httpOnly: true, secure: true })
    .json({ success: true });
});
Frontend: Auto-Refresh Token
javascript
// axios interceptor or fetch wrapper
const refreshToken = async () => {
  const res = await fetch("/api/auth/refresh", { credentials: "include" });
  return res.ok;
};

// Retry failed requests (401) with new token
fetch("/api/protected-route").catch(async (err) => {
  if (err.response?.status === 401) {
    await refreshToken();
    return fetch("/api/protected-route"); // Retry
  }
  throw err;
});
Security Best Practices
 Use HTTP-only cookies (prevent XSS attacks).
 Short-lived accessToken + long-lived refreshToken.
 Always validate tokens server-side.
 Clear cookies on logout.
 Use sameSite: "strict" for CSRF protection.

Flow Summary
Login → Tokens issued + stored in cookies + DB.

Protected Routes → verifyJWT checks tokens.

Logout → Tokens cleared from DB + cookies.

Token Refresh → Silent re-authentication.

This ensures secure, stateless authentication with JWT + cookies. 🔒

 */