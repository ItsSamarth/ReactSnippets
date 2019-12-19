import React, { Component } from "react";
import Dropzone from "react-dropzone-uploader";
import AXIOS from "../utils/api";
import uuidv4 from "uuid/v4";
import md5 from "md5";

export default class FileUploader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadingImages: {},
      dataUnsaved: true
    };
  }

  getUploadParams = data => {
    // console.log("Uploading file", file, meta);
    // console.log("blob url", meta.previewUrl);
    // let blob = meta.previewUrl;
    // let base64data = "";
    // var reader = new window.FileReader();
    // reader.readAsDataURL(blob);
    // reader.onloadend = function() {
    //   base64data = reader.result;
    //   console.log(base64data);
    // };
    // console.log("Image to blob ele", blob);
    return { url: `http://localhost:8080/api/file/upload/${data.meta.id}` };
  };

  removeFile = meta => {
    let options = {
      url: `/file/upload/${meta.id}-${meta.name}`,
      method: "delete"
    };

    return AXIOS(options);
  };

  handleChangeStatus = ({ meta, file }, status) => {
    // console.log("handle change status", meta);

    // console.log("meta base64 file", readAsDataURL(meta.previewUrl));
    // var myBlob = new Blob(["Hello"], { type: "text/plain" });

    if (status === "getting_upload_params") {
      // var myReader = new FileReader();
      // var view;
      // var ele;

      //handler executed once reading(blob content referenced to a variable) from blob is finished.
      // myReader.addEventListener("loadend", function(e) {
      //   let ele = e.srcElement.result;

      // console.log("ele", ele);
      // let view = new Uint8Array(ele);
      // var md = md5(view);
      // meta.id = md;
      // var md5 = CryptoJS.MD5(view);
      // console.log(" ------- > ", md5(view));
      //create chunking of 1mb each
      // let remainingBytes = view.length;
      // let sentBytes = 0;
      // while (sentBytes < view.length) {
      //   console.log("Comaprision", sentBytes, remainingBytes, view.length);
      //   if (remainingBytes >= 40000000) {
      //     console.log(
      //       "sliced 1 mb array",
      //       view.slice(sentBytes, sentBytes + 40000000)
      //     );
      //     sentBytes += 40000000;
      //     remainingBytes -= 40000000;
      //   } else {
      //     console.log(
      //       "sliced remaining bytes array",
      //       view.slice(sentBytes, sentBytes + remainingBytes)
      //     );
      //     sentBytes += remainingBytes;
      //     remainingBytes = 0;
      //   }
      // }

      //New way to create chunks
      let filePart = "";
      let start = 0;
      let fileSize = file.size;

      console.log("Now file size is", file.size);
      let sentByte = 0;
      while (sentByte < fileSize) {
        start = sentByte;

        if (fileSize - sentByte >= 1000000) {
          filePart = file.slice(sentByte, sentByte + 1000000);
          sentByte += 1000000;
        } else {
          console.log("Last part of file slicing", fileSize - sentByte);
          console.log("we are sending", sentByte, " ", fileSize);
          filePart = file.slice(sentByte, fileSize);
          sentByte += fileSize - sentByte;
        }
        console.log(
          "file part we are sending is ",
          start,
          "sentByte = ",
          sentByte,
          "File part remians",
          filePart
        );
      }
      // });
      //start the reading process.
      // myReader.readAsArrayBuffer(file);
    }
    // console.log("My reader as array buffer", myReader[0]);

    if (status === "preparing") {
      // meta.id = uniqueId;
      console.log("status", meta);
    }

    if (status === "removed") {
      this.removeFile(meta);
    }
    console.log("-=-=-=-=-=-=", status, meta);
  };

  handleSubmit = (files, allFiles) => {
    console.log("Handele submit");
    console.log(files.map(f => f.meta));
    allFiles.forEach(f => f.remove());
  };

  componentCleanup = e => {
    if (true) {
      e.preventDefault();
      e.returnValue = true;
    }
  };

  beforeunload(e) {
    if (this.state.dataUnsaved) {
      e.preventDefault();
      // e.returnValue = true;
    }
  }

  componentDidMount() {
    // window.addEventListener("beforeunload", this.componentCleanup); // remove the event handler for normal unmounting
    window.addEventListener("beforeunload", this.beforeunload.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.beforeunload.bind(this));
  }

  render() {
    return (
      <div>
        <Dropzone
          getUploadParams={this.getUploadParams}
          onChangeStatus={this.handleChangeStatus}
          onSubmit={this.handleSubmit}
          accept="image/*,video/*"
          inputContent={(files, extra) =>
            extra.reject
              ? "Image and video files only"
              : "Drag Files or Click to Browse"
          }
          styles={{
            dropzoneReject: { borderColor: "red", backgroundColor: "#DAA" },
            inputLabel: (files, extra) => (extra.reject ? { color: "red" } : {})
          }}
        />
        <p id="text"></p>
      </div>
    );
  }
}
