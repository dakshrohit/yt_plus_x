import mongoose from "mongoose";
import { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userschema= new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true, // this makes the field searchable


    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,


    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true, // this makes the field searchable


    },

    avatar:{
        type:String, // we will use cloudinary url service (its just like AWS)
        required:true,
        


    },
    coverimage:{
        type:String, // cloudnary url
    },
    watchhistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true,'Password is required']
    },
    refreshtokens:{
        type:String
    }



},{
    timestamps:true
})

// using pre hook to hash the password just before saving it
// we have used bcrypt package for this
userschema.pre("save",async function (next) {
    if(!this.isModified("password")) 
        {return next();}

    this.password = await bcrypt.hash(this.password,10)
    next()
    /* Purpose: Checks if the password field was modified

Why? Avoids unnecessary re-hashing of already hashed passwords

Behavior:

If password wasn't modified, skips hashing and calls next()

If password was modified, proceeds to hash it


next() :->

Purpose: Proceeds to save the document after hashing

Required in all Mongoose middleware to continue the operation

*/
})


userschema.methods.isPasswordCorrect = async function (password) {
     return await bcrypt.compare(password,this.password)
}
// we have added a method to compare the passwords


/* 
This code defines an instance method on a Mongoose user schema that verifies if a provided password matches the user's stored (hashed) password.
Schema Method Definition

userSchema.methods adds an instance method to the schema

isPasswordCorrect becomes available on all user document instances
Password Verification

Takes a plain text password as input

Uses bcrypt.compare() to check against the stored hash (this.password)

Returns true if they match, false if they don't
Async/Await

Marked as async because bcrypt comparison is asynchronous

await waits for the comparison to complete before returning

WE CAN ALSO Generate Access Tokens in Mongoose Schema by creating a method in a similar way
*/


userschema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id: this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )

}
userschema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id: this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )

}

export const User = mongoose.model("User",userschema)