let apiConfig = require("./api.json");
let base_url = apiConfig.api;
const CONFIG = {
  base_url: base_url,
  s3: {
    fields: {
      AWSAccessKeyId: "AKIAI3V7H4N4QZBYTENQ",
      acl: "public-read",
      key: "files/89789486-d94a-4251-a42d-18af752ab7d2-test.txt"
    },
    fileUrl: "https://tmtload.s3.ap-south-1.amazonaws.com/files/test.txt",
    uploadUrl: "https://tmtload.s3.ap-south-1.amazonaws.com/"
  }
};

export default CONFIG;
