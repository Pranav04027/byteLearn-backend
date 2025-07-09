/*
Multer is a middleware that helps with:
1) Accepts files from clints
2)Temporarily store them
3)Attach them to req.files or req.file so you can access them in your controller
*/

//USED IN ROUTES
import multer from "multer";


// multer.fields() RETURNS a middleware function with next() built-in
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/temp')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

//Creates a reusable upload middleware.
export const upload = multer(
  { 
    storage: storage // Or storage (js101)
  }
)