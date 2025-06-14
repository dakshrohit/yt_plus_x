// this middleware will verify if there is user or not

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";

export const verifyJWT=asyncHandler(async(req,_,next)=>{
    // if we are not using res, so replece it by "_"
    try {
        // take the tokens from the cookies we got.
        const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer","")
        if(!token){
            throw ApiError(401,"Unauthorized request")
        }
        
        const decodedtoken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET) // the token which user recieves and the token which is stored in the db are both diff bcs the user gets encrypted version and the db has raw tokens
        
        // // /home/dakshrohit/Pictures/Screenshots/Screenshot From 2025-06-14 23-25-52.png

        /* When you decode a JWT (JSON Web Token) using jwt.verify(), the decodedToken contains the payload that was originally embedded in the token during its creation (usually during login).  */
/*{
  _id: "65a1b2c3d4e5f6g7h8i9j0k",  // User's MongoDB _id
  role: "user",                    // Optional custom claim
  iat: 1630000000,                 // Issued at (Unix timestamp)
  exp: 1630000900                  // Expiration time (Unix timestamp)
} */
        const user=await User.findById(decodedtoken?._id).select("-password -refreshtokens")
        if(!user){
            throw new ApiError(401,"Invalid access token")
    
        }
    
        req.user=user;
        next();
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token")
        
    }
})


/*Why verifyJWT is Needed for Logout
Authentication Check

Logout should only be allowed for logged-in users.

verifyJWT confirms:

The request has a valid accessToken.

The token hasn’t been tampered with or expired.

Identify the User

The middleware decodes the JWT to get the user’s _id → fetches the user from DB → attaches it to req.user.

This req.user._id is used to remove the correct refresh token from the database:

javascript
await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
Security

Without verifyJWT, anyone could send a logout request, even with a fake/invalid token.

Ensures only the token owner can log themselves out.


When a user logs in, they receive a signed accessToken containing their _id:

javascript
// During login (generateAccessAndRefreshTokens.js)
const accessToken = jwt.sign(
  { _id: user._id },  // Embed user's unique ID in the token
  process.env.ACCESS_TOKEN_SECRET,
  { expiresIn: "15m" }
);
When logging out, the accessToken is sent back (via HTTP-only cookie or Authorization header).

verifyJWT verifies the token’s signature using ACCESS_TOKEN_SECRET:

javascript
const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
If the token is tampered with or expired, verification fails → 401 Unauthorized.

Why This Prevents Impersonation
A hacker cannot forge a valid token without knowing ACCESS_TOKEN_SECRET.

Even if they steal a token, they can’t modify it (JWT is cryptographically signed).

Short expiry (e.g., 15 mins) reduces the window for misuse.

2. Database Check: Confirming User Exists
How It Works
After decoding the token, verifyJWT checks if the user still exists:

javascript
const user = await User.findById(decodedToken._id).select("-password -refreshToken");
if (!user) throw new ApiError(401, "Invalid access token");
This ensures:

The user hasn’t been deleted since login.

The account hasn’t been banned or deactivated.

Why This Prevents Exploits
An attacker can’t log out a deleted user (token would be invalid).

Even if they guess a valid _id, the database check blocks unauthorized access.

3. Attaching req.user: Restricting Actions
there is no element of user in the req object.we create it ie verifyjwt adds the user object in req after validating the token, it contains the authenticated user's data.
in logout controller, we can use user obj to get the data of the user from db using req.user._id and using this we remove the refresh token from the db
How It Works
Once verified, the user is attached to the request:

javascript
req.user = user; // { _id: "123", username: "alice", email: "alice@example.com" }
The logoutUser function only acts on req.user._id:

javascript
await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });*/
