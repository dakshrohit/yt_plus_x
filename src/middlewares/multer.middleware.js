import multer from "multer";
const storage = multer.diskStorage({ 
    //You are creating a custom disk storage engine for multer. This tells multer how to store uploaded files on the disk (rather than memory or a remote location).

    // function 1 -> Tells multer where to store the uploaded files
  destination: function (req, file, cb) {
    cb(null, './public/temp') // cb(null, './public/temp'): This sets the destination folder to ./public/temp
  }, 
  // cb-> call back whose first parameter is error (null if none)
      // second is the destination path


  // function 2 -> Tells multer what to name the uploaded file on the disk.


  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // cb(null, file.fieldname + '-' + uniqueSuffix)
    cb(null,file.originalname)

  }
})

// export const upload = multer({storage});
export const upload = multer({ 
    storage, 
})

// read the docs of mutler

// https://github.com/expressjs/multer/blob/main/doc/README-fr.md 


// we can upload files at either memory or diskspace.
// uploading in memory means taking up of spaces
// prefer uplaoding in diskspace









