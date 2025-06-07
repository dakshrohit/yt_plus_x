// dont need to write handlers multiple times in the app.js, so we write them once in here and we will call this when we need 
// we can either use try/catch or promises concept (.then,.catch)



/*



//This is a higher-order function that wraps asynchronous Express route handlers to automatically handle errors. 
// It's a common pattern in Node.jsThis is a higher-order function that wraps asynchronous Express route handlers to automatically handle errors. It's a common pattern in Node.js/Express applications to avoid repetitive try-catch blocks./Express applications to avoid repetitive try-catch blocks. 


const asyncHandler = (fn)=> {
    //Takes a route handler function fn as input
    //Returns a new function with Express's (req, res, next) signature
    //Wraps the execution of fn in a try-catch block

    // If fn throws an error or rejects a Promise:

   // Sets HTTP status code (uses err.code if available, otherwise 500)

   // Returns a JSON error response with success: false and the error message
    async (req,res,next)=>{
        try {
            await fn(req,res,next)
            
        } catch (err) {
            res.status(err.code || 500).json({
                success:false,
                message:err.message
            })
        }
    }
    
} // can also be written as const asynchandler = (fn) => async () => {}



*/


/*           SECOND METHOD (USING PROMISE CONCEPT (i.e. .THEN().CATCH() OR .RESOLVE().CATCH()   )) */
const asyncHandler =(fn)=>{

    (req,res,next) => {
        Promise.resolve(fn(req,res,next)).catch((err)=>next(err))
    }
    // simply means if the promise is resolved then execute fn with the parameters passed other wise run the catch func

}




export {asyncHandler}