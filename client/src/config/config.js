let apiConfig = require("./api.json");
let base_url = apiConfig.api;
const CONFIG = {
  base_url: base_url,
  s3: {
    fields: {
      AWSAccessKeyId: "",
      acl: "public-read",
      key: ""
    },
    fileUrl: "",
    uploadUrl: ""
  }
};

export default CONFIG;
