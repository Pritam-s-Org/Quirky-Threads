import path from "path";
import fs from "fs";
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";
const router = express.Router();

// Cloudinary configuration
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
//   secure: true
// });
const uploadDir = process.env.UPLOAD_DIRECTORY;

[uploadDir, "uploads/", `${uploadDir}/gifs`].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination(req, file, cb){
    cb(null, "uploads/")
  },
  filename(req, file, cb){
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
  }
})

function fileFilter(req, file, cb) {
  const filetypes = /jpe?g|png|webp|gif/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp|image\/gif/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = mimetypes.test(file.mimetype)
  if (extname && mimetype) {
    cb(null, true)
  } else {
    cb(new Error("Images only!"), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
})

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();

    if (fileExt === ".gif") {
      const destPath = path.join(`${uploadDir}/gifs`, req.file.filename);
      await fs.promises.rename(filePath, destPath);
      return res.json({
        message: "Gif Uploaded",
        imagePath: `/${filePath}`,
        imageUrl: `${baseUrl}/uploads/gifs/${req.file.filename}`
      });
    }

    const optimizedFileName = path.parse(req.file.filename).name + ".webp";
    const optimizedPath = path.join( uploadDir, optimizedFileName);

    await sharp(filePath)
      .resize({ width: 1000 })
      .toFormat("webp", { quality: 80 })
      .toFile(optimizedPath);

    await fs.promises.unlink(filePath); // Delete the local file after upload
  
    res.status(200).json({
      message: "Image Uploaded",
      imagePath: `/${filePath}`,
      imageUrl: `${baseUrl}/uploads/${optimizedFileName}`
    })
  } catch (error) {
    res.status(500).json({ error: "Image upload failed", details: error });
  }
})

export default router;

// ********************** Google Drive Upload Code ********************** //

// import express from "express";
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import drive from "../config/googleDrive.js";
// // import { uploadImageToDrive } from "../controllers/uploadController.js";

// const router = express.Router();

// const storage = multer.diskStorage({
//   destination(req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename(req, file, cb) {
//     cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
//   },
// });

// function fileFilter(req, file, cb) {
//   const filetypes = /jpg|jpeg|png|webp/;
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = filetypes.test(file.mimetype);
//   if (extname && mimetype) {
//     return cb(null, true)
//   } else {
//     cb(new Error("Please upload an image file (jpg/ jpeg/ png)"), false);
//   }
// }

// const upload = multer({ storage, fileFilter });

// router.post("/", upload.single("image"), async (req, res) => {
//   try {
//     const filePath = req.file.path;

//     const fileMetadata = {
//       name: req.file.filename,
//       parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
//     };

//     const media = {
//       mimeType: req.file.mimetype,
//       body: fs.createReadStream(filePath),
//     };

//     const driveResponse = await drive.files.create({
//       resource: fileMetadata,
//       media: media,
//       fields: "id",
//     });

//     const driveFileId = driveResponse.data.id;

//     await drive.permissions.create({
//       fileId: driveFileId,
//       requestBody: {
//         role: "reader",
//         type: "anyone",
//       },
//     });

//     fs.unlinkSync(filePath);

//     res.status(200).json({
//       message: "File uploaded to Google Drive",
//       driveFileId,
//       publicUrl: `https://drive.google.com/uc?id=${driveFileId}`,
//     });
//   } catch (error) {
//     console.log("Google Drive upload error:", error);
//     res.status(500).json({ error: "Google Drive upload failed", details: error.message });
//   }
// });

// export default router;
