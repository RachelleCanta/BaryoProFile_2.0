import multer from "multer";
import fs from "fs";

// * setup multer for uploading images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images"); // * ensure "uploads" directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, `${uniqueSuffix}${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // * limit files to 5MB
  fileFilter: (req, file, cb) => {
    // * accept only specific file types
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only JPEG, PNG, and JPG are allowed."),
        false
      );
    }
  },
});

// * Middleware to check if file is missing
const checkFile = (req, res, next) => {
  if (!req.file) {
    let response = {};
    response.error = "Image upload failed or missing!";
    return res.status(400).json(response);
  }
  next();
};

// * removing the image in uploads folder
const removeImage = (imageString) => {
  const filePath = "public/images/" + imageString;
  fs.unlink(filePath, (err) => {
    if (err) console.error("Failed to delete file:", err);
  });
};

export { checkFile, upload, storage, removeImage };
