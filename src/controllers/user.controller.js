import {asyncHandler} from "../utils/asyncHandler.js"
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
})




export {registeruser};