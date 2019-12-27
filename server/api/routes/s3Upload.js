const express = require("express");
const router = express.Router();
var aws = require("aws-sdk");

aws.config.update({
  accessKeyId: "AKIASKFNFEOTC6LR5SEW",
  secretAccessKey: "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",
  region: "ap-south-1"
});

// router.post("/new/presigned", (req, res) => {
//   var params = {
//     Bucket: "tmtload",
//     Fields: {
//       key: "key"
//     }
//   };
//   AWS.S3.createPresignedPost(params, function(err, data) {
//     if (err) {
//       console.error("Presigning post data encountered an error", err);
//     } else {
//       console.log("The post data is", data);
//     }
//   });
//   return res.status(200).json("ok");
// });

router.post("/presigned", (req, res) => {
  var s3 = new aws.S3({ signatureVersion: "v4" });
  // console.log("Req. body", req.body);
  //   return res.status(200).json({
  //     message: "ok",
  //     body: req.body
  //   });
  var params = {
    Bucket: "tmtload",
    Key: req.body.name,
    Expires: 900,
    ContentType: req.body.type
  };

  s3.getSignedUrl("putObject", params, function(err, data) {
    if (err) {
      console.log(err);

      return res.status(500).json(err);
    } else {
      return res.status(200).json(data);
    }
  });
});

module.exports = router;
