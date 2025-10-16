import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileStorage } from "../../configs/env.config.js";
import { uploadToCloudinary } from "./cloudinary.js";
import { HttpException } from "../exceptions/index.js";

let storage;
let fullPath;

const memoryStorage = multer.memoryStorage();

const diskStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    fullPath = `./public/uploads/${file.fieldname || "other"}s`;

    try {
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      cb(null, fullPath);
    } catch (err) {
      console.error(err);
      return cb(err);
    }
  },

  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const randomStr = crypto.randomBytes(4).toString("hex");
    const userId = req?.user?.id || "unknown";

    // Creating the final filename
    const filename = `${userId}-${timestamp}-${randomStr}${path.extname(
      file.originalname,
    )}`;

    req.body[file.fieldname] = `${fullPath}/${filename}`.slice(8);

    cb(null, filename);
  },
});

const upload = (req, res, next) => {
  try {
    if (fileStorage.target === "cloudinary") {
      storage = memoryStorage;
    } else if (fileStorage.target === "local") {
      storage = diskStorage;
    } else {
      throw new HttpException(
        400,
        "Invalid file storage target!",
        "File Upload",
      );
    }

    const upload = multer({
      storage,
    });

    upload.any()(req, res, (err) => {
      if (err) {
        return res
          .status(400)
          .json({ message: "File upload failed", error: err });
      }
      if (fileStorage.target === "cloudinary") {
        uploadToCloudinary(req, res).then(() => {
          next();
        });
      } else {
        next();
      }
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export default upload;
