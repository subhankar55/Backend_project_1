import multer from "multer";

// multer middle-ware for disk storage 
// multer is used to file-upload

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

export const upload = multer({ storage });