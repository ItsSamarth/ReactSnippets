const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const scanFile = require("../utils/fileScanner");
const path = require("path");

//Multer config
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    console.log("Destination multer");
    console.log("re file", req.file);
    console.log("file", file);
    console.log("file headers", req.headers);
    // let { id } = req.params;

    let fileHash = req.headers["x-filehash"];
    let fileId = req.headers["x-fileId"];
    // let fileName = req.headers["x-chunknumber"] + ".tmp";
    // console.log(req.headers);
    // console.log("fileHash", fileHash, fileName);
    // get the extensions from the file namme
    let fileName = req.headers["x-filename"];
    let extension = path.extname(fileName);
    let chunkNumber = req.headers["x-chunknumber"];

    // console.log("chunnk number", chunkNumber);
    // console.log(typeof chunkNumber);

    // Get the base file name
    let baseFileName = path.basename(fileName, extension);

    // Create the temporary file name for the chunks
    let tempFileName = baseFileName + "." + chunkNumber + extension + ".tmp";

    console.log(tempFileName);

    // Create the temporary directory to store the file chunk
    // the temporary directory will be based on the file name

    let tempDir = "../../../temp/" + fileHash;
    tempDir = path.join(__dirname + tempDir);
    // The path to save the file chunk
    let localFilePath = tempDir + tempFileName;

    // if (fs.ensureDirSync(tempDir)) {
    //   console.log("Created Directory " + tempDir);
    // }

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    cb(null, tempDir);
  },
  filename: function(req, file, cb) {
    let fileName = req.headers["x-filename"];
    let extension = path.extname(fileName);
    let chunkNumber = req.headers["x-chunknumber"];
    // Get the base file name
    let baseFileName = path.basename(fileName, extension);
    // Create the temporary file name for the chunks
    let tempFileName = baseFileName + "." + chunkNumber + extension + ".tmp";
    cb(null, tempFileName);
  }
});

//multer custom storage engine
// const storage = myCustomStorage({
//   destination: function(req, res, cb) {
//     cb(null, "./uploads/" + file.originalname);
//   }
// });

// const fileFilter = (req, file, cb) => {
//   // reject a file
//   if (
//     file.mimetype === "image/jpeg" ||
//     file.mimetype === "image/png" ||
//     file.mimetype === "video/mp4"
//   ) {
//     cb(null, true);
//   } else {
//     cb(new Error("Profile Image must be a Jpg, Jpeg, Png image only."), false);
//   }
// };

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 100
  }
  // fileFilter: fileFilter
});

//get all images
router.get("/image", (req, res) => {
  res.status(200).json({
    message: "Fetching images"
  });
});

//upload image
router.post(
  "/upload/:id",
  upload.array("fileChunk", 12),
  async (req, res, err) => {
    try {
      let dirName = path.join(
        __dirname,
        "../../uploads/" + req.params.id + "-" + req.file.originalname
      );
      const avStatus = await scanFile(`${dirName}`); // Pass the full path of the file
      console.log("Antivirus status", avStatus);
      // All OK!

      return res.status(200).json({
        message: "file uploaded and no virus found"
      });
    } catch (err) {
      console.log("Raise alarm!", err);
      return res.status(500).json({
        error: err
      });
    }
  }
);

//uploding chunks
router.post("/chunk/upload", upload.array("fileChunk", 12), (req, res) => {
  //content type check
  if (!req.is("multipart/form-data")) {
    return res.status(415).send("Unsupported media type");
  }

  // check that we are not exceeded the maximum  chunk upload size
  var maxUploadSize = 51 * 1024 * 1024;

  if (req.headers["content-length"] > maxUploadSize) {
    return res.status(413).send("Maximum upload chunk size exceeded");
  }

  console.log("print request body");
  console.log("Request body", req.body);
  console.log("Request body", req.file);

  // CREATING TEMP FOR CHUNKS

  return res.status(200).json("ok");
});

router.delete("/upload/:id", (req, res, err) => {
  let { id } = req.params;
  fs.unlink(`./uploads/${id}`, response => {
    return res.status(200).json({
      message: "file deleted"
    });
  });
});

module.exports = router;
