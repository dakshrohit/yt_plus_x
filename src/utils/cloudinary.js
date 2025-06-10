// we will first upload the files in our server (localstorage) using mutler and then we will upload them to the cloudinary
// after uploading them to cloudinary, we will remove them from our server
// by storing locally, we can modify them if we want


import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // file system

// there is no deletion of files, we just unlink the files from the file system

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});
//       HOW TO CHECK IF WE ARE CONNECTED TO CLOUDINARY SUCCESSFULLY OR NOT, IF NOT WHAT IS THE ERROR
// cloudinary.api.ping((error, result) => {
//   if (error) console.error("Cloudinary connection error:", error);
//   else console.log("Cloudinary connected:", result);
// });


// should give something like this :
//  MongoDB connected !! DB HOST: ac-8h36ujl-shard-00-01.i2ro8yu.mongodb.net
// Server is running at port : 8000.
// Cloudinary connected: {
//   status: 'ok',
//   rate_limit_allowed: 500,
//   rate_limit_reset_at: 2025-06-10T15:00:00.000Z,
//   rate_limit_remaining: 497
// }

const uploadoncloudinary = async (localfilepath)=>{
    try {
        if(!localfilepath){
            return null
        }

        // uploading the file on cloudinary
        const response= await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto"
        })
        
        //await pauses execution until the Promise settles, then:
        // Returns the resolved value if the Promise fulfills
        // Throws the rejection reason if the Promise rejects
// response object: looks like this
//{
//   public_id: 'sample123',        // Unique public identifier
//   version: 1234567890,           // Version number
//   width: 800,                    // For images/videos
//   height: 600,                   // For images/videos
//   format: 'jpg',                 // File format
//   resource_type: 'image',        // Type of resource
//   created_at: '2023-01-01T...',  // Upload timestamp
//   bytes: 12345,                  // File size
//   url: 'https://res.cloudinary.com/...',          // Access URL
//   secure_url: 'https://res.cloudinary.com/...',   // HTTPS version
//   original_filename: 'myphoto',  // Original filename
//   // Plus many more metadata fields...
// }

        // file uploaded successfully
        // console.log("FILE IS UPLOADED SUCCESSFULLY ON CLOUDINARY !",response.url); //commenting after we have tested via postman that files are getting uploaded in cloudinary
        fs.unlinkSync(localfilepath) // unlinking the files once successfully uploaded from localserver  in cloudinary 
        return response;
        


        
    } catch (error) {
        fs.unlinkSync(localfilepath);  // removes the locally saved temporary file as the upload operation got failed 
        return null;
        
        
    }
}







export {uploadoncloudinary}



   // DOCS METHOD
// cloudinary.v2.uploader
// .upload("dog.mp4", {
//   resource_type: "video", 
//   public_id: "my_dog",
//   overwrite: true, 
//   notification_url: "https://mysite.example.com/notify_endpoint"})
// .then(result=>console.log(result));