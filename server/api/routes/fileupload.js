const express = require("express");
const router = express.Router();
const fileUploadController = require("../controller/fileupload");
const multer = require("multer");
const fs = require("fs");
const scanFile = require("../utils/fileScanner");
const path = require("path");

//Multer config
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function(req, file, cb) {
    let { id } = req.params;
    cb(null, id + "-" + file.originalname);
  }
});

//multer custom storage engine
// const storage = myCustomStorage({
//   destination: function(req, res, cb) {
//     cb(null, "./uploads/" + file.originalname);
//   }
// });

const fileFilter = (req, file, cb) => {
  // reject a file
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "video/mp4"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Profile Image must be a Jpg, Jpeg, Png image only."), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 100
  },
  fileFilter: fileFilter
});

//get all images
router.get("/image", (req, res) => {
  res.status(200).json({
    message: "Fetching images"
  });
});

//upload image
router.post("/upload/:id", upload.single("file"), async (req, res, err) => {
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
});

router.delete("/upload/:id", (req, res, err) => {
  console.log(req.params);

  // return res.status(200).json({
  //   message: "success"
  // });
  let { id } = req.params;
  // let fileName = req.body.name;
  // console.log(fileId, fileName);
  // console.log(req.body);
  // if (err) {
  //   console.log(err);
  //   return res.status(500).json({ error: err });
  // }

  fs.unlink(`./uploads/${id}`, response => {
    console.log("callback response", response);
    return res.status(200).json({
      message: "file deleted"
    });
  });
});

module.exports = router;
