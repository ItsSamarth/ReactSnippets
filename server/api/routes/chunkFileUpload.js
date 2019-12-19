const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

router.post("/upload", (req, res) => {
  if (req.method === "POST") {
    //content type check
    if (!request.is("multipart/form-data")) {
      return res.status(415).send("Unsupported media type");
    }

    // check that we are not exceeded the maximum  chunk upload size
    var maxUploadSize = 51 * 1024 * 1024;

    if (req.headers["content-length"] > maxUploadSize) {
      return res.status(413).send("Maximum upload chunk size exceeded");
    }

    // CREATING TEMP FOR CHUNKS
    // get the extensions from the file namme
    let extensions = path.extname(req.param("filename"));

    // Get the base file name
    let baseFileName = path.basename(req.param("filename"), extension);

    // Create the temporary file name for the chunks
    let tempFileName =
      baseFileName +
      "." +
      req
        .param("chunkNumber")
        .toString()
        .padLeft("0", 16) +
      extension +
      ".tmp";

    // Create the temporary directory to store the file chunk
    // the temporary directory will be based on the file name

    let tempDir =
      "../../temp" + req.param("directoryName") + "/" + baseFileName;

    // The path to save the file chunk
    let localFilePath = tempDir + "/" + tempFileName;

    if (fs.ensureDirSync(tempDir)) {
      console.log("Created Directory " + tempDir);
    }
  }
});

module.exports = router;
