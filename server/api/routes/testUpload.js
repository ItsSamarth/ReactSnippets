const express = require("express");
const router = express.Router();
var AWS = require("aws-sdk");
const BUCKET_NAME = "tmtload";
// aws.config.update({
//   accessKeyId: "AKIASKFNFEOTC6LR5SEW",
//   secretAccessKey: "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",
//   region: "ap-south-1"
// });

const s3 = new AWS.S3({
  accessKeyId: "",
  secretAccessKey: "",
  region: "ap-south-1"
});

router.get("/", (req, res) => {
  return res.status(200).json("Test routes called");
});

router.get("/start-upload", async (req, res) => {
  try {
    console.log("Req body", req.body);
    console.log("Req file", req.file);
    console.log("Req query", req.query);
    let params = {
      Bucket: BUCKET_NAME,
      Key: req.query.fileName,
      ContentType: req.query.fileType
    };

    return new Promise((resolve, reject) =>
      s3.createMultipartUpload(params, (err, uploadData) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.send({ uploadId: uploadData.UploadId }));
        }
      })
    );
  } catch (err) {
    console.log(err);
    return err;
  }
});

router.get("/get-upload-url", async (req, res) => {
  try {
    let params = {
      Bucket: BUCKET_NAME,
      Key: req.query.fileName,
      PartNumber: req.query.partNumber,
      UploadId: req.query.uploadId
    };

    return new Promise((resolve, reject) =>
      s3.getSignedUrl("uploadPart", params, (err, presignedUrl) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.send({ presignedUrl }));
        }
      })
    );
  } catch (err) {
    console.log(err);
    return err;
  }
});

router.post("/complete-upload", async (req, res) => {
  try {
    console.log(req.body, ": body");
    let params = {
      Bucket: BUCKET_NAME,
      Key: req.body.params.fileName,
      MultipartUpload: {
        Parts: req.body.params.parts
      },
      UploadId: req.body.params.uploadId
    };
    console.log(params);
    return new Promise((resolve, reject) =>
      s3.completeMultipartUpload(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.send({ data }));
        }
      })
    );
  } catch (err) {
    console.log(err);
    return err;
  }
});

router.post("/listMultiPartUpload", async (req, res) => {
  try {
    let params = {
      Bucket: BUCKET_NAME,
      KeyMarker: req.body.params.fileName,
      MaxUploads: 10,
      UploadIdMarker: req.body.params.uploadId
    };

    return new Promise((resolve, reject) => {
      s3.listMultipartUploads(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(res.send({ data }));
        }
      });
    });
  } catch (err) {
    console.log(err);
    return err;
  }
});

module.exports = router;
