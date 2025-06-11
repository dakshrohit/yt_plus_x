import { Router } from "express";
import { loginuser, logoutuser, registeruser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router =Router()

router.route("/register").post(
    // injecting middleware: mutler (here)
    //When using multer.fields(), each field config object typically only supports these main properties: name and maxCount

    upload.fields(
        //Tells multer to expect a multi-field file upload:


        [
        {
            name:"avatar",
            maxCount:1
            
        },
        {
            name:"coverimage",
            maxCount:1

        } // / One file with field name "avatar" (max 1 file)
         // One file with field name "coverimage" (max 1 file)

    ]),
    registeruser
)
router.route("/login").post(loginuser)


// secures routes
router.route("/logout").post(verifyJWT,logoutuser); // verifyjwt is a middleware which will run first and it has next in it, so after that logoutuser will run

export default router;