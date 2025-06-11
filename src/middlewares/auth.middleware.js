// this middleware will verify if there is user or not

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";

export const verifyJWT=asyncHandler(async(req,_,next)=>{
    // if we are not using res, so replece it by "_"
    try {
        const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer","")
        if(!token){
            throw ApiError(401,"Unauthorized request")
        }
        const decodedtoken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
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

