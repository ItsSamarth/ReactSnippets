const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const scanFile = require("../utils/fileScanner");
const path = require("path");
const spawn = require("child_process").spawn;

//Multer config
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    let fileId = req.headers["x-fileid"];
    let fileName = req.headers["x-filename"];
    let extension = path.extname(fileName);
    let chunkNumber = req.headers["x-chunknumber"];

    // Get the base file name
    let baseFileName = path.basename(fileName, extension);

    // Create the temporary file name for the chunks
    let tempFileName = baseFileName + "." + chunkNumber + extension + ".tmp";

    // Create the temporary directory to store the file chunk
    // the temporary directory will be based on the file name

    let tempDir = "../../../temp/" + fileId;
    tempDir = path.join(__dirname + tempDir);
    // The path to save the file chunk
    let localFilePath = tempDir + tempFileName;
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

//READING FILES

function readFiles(dirname, onFileContent, onError) {
  fs.readdir(dirname, function(err, filenames) {
    if (err) {
      onError(err);
      return;
    }
    filenames.forEach(function(filename) {
      fs.readFile(dirname + filename, "utf-8", function(err, content) {
        if (err) {
          onError(err);
          return;
        }
        onFileContent(filename, content);
      });
    });
  });
}

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
  console.log("Console main function-=-=-=-=-=--=");
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
  console.log("Request file", req.file);

  // Validating chunks

  return res.status(200).json("ok");
});

//spawn the bash command to concat files
function concatChunkUsingSpawn(tempDir, uploadDir, name, totalChunks) {
  let command = "cat";
  let args = [];

  let fileName = name;
  let extension = path.extname(fileName);
  // Get the base file name
  let baseFileName = path.basename(fileName, extension);
  // Create the temporary file name for the chunks
  while (totalChunks > 0) {
    let tempName = baseFileName + "." + totalChunks + extension + ".tmp";
    // args.push(`"${tempName}"`);
    args.push(tempName);
    totalChunks -= 1;
  }
  args.push(" > combined.jpg");

  console.log(args);
  console.log("working directory", tempDir);

  let options = {
    cwd: tempDir,
    shell: true
  };

  var newFile = "";

  try {
    var cmd = spawn(command, args, options);
  } catch (err) {
    console.log("Error in spawn", err);
  }

  // cmd.stdout.on("data", chunk => {
  //   console.log(chunk);
  // });

  // cmd.stderr.pipe(dest);

  cmd.stdout.on("data", stdout => {
    console.log("#3. spawn");
    console.log(stdout);
    // newFile = newFile + stdout.toString();
    // console.log(stdout.toString());
  });

  cmd.stderr.on("data", stderr => {
    console.log("stderr in spawn");
    console.log(stderr.toString());
  });

  cmd.on("close", code => {
    console.log(`Child process exited with code ${code}`);
  });

  fs.writeFile("test.jpg", buffer, "binary", function(err) {
    console.log("Error", err);
  });
}

//concat chunks
router.post("/chunk/concat", (req, res) => {
  try {
    console.log("Request headers", req.body);
    let { id, name, totalChunks } = req.body;
    //combining chunks
    var data = {};

    //directory
    let tempDir = "../../../temp/" + id;
    tempDir = path.join(__dirname + tempDir);

    //upload dir
    let uploadDir = "../../../uploads/" + id;
    uploadDir = path.join(__dirname + uploadDir);

    let result = concatChunkUsingSpawn(tempDir, uploadDir, name, totalChunks);
    //upload file dir
    // let uploadDir = "../../../uploads/" + id;
    // uploadDir = path.join(__dirname + uploadDir);
    // fs.writeFile(uploadDir);

    return res.status(200).json({
      message: "done"
    });
  } catch (err) {
    console.log("Getting error");
    return res.status(500).json(err);
  }
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
