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

  uploadUsingAxios = (fileChunk, chunkNumber, totalFileSize, meta) => {
    console.log("UPload using axios", fileChunk, chunkNumber, totalFileSize);

    let formData = new FormData();
    formData.append("fileId", meta.id);
    formData.append("chunkNumber", chunkNumber);
    formData.append("fileChunk", fileChunk);
    formData.append("totalFileSize", totalFileSize);
    formData.append("fileName", meta.name);
    let options = {
      url: `http://localhost:8080/api/file/chunk/upload`,
      data: formData,
      method: "post",
      headers: {
        "x-fileHash": meta.id,
        "x-chunkNumber": chunkNumber,
        "x-totalFileSize": totalFileSize,
        "x-fileName": meta.name,
        "x-fileid": meta.id
      }
    };

    return AXIOS(options);
  };

  concatUsingAxios = meta => {
    console.log("concatUsingAxios", meta);
    let options = {
      url: `http://localhost:8080/api/file/chunk/concat`,
      method: "post",
      data: meta
    };
    return AXIOS(options);
  };

  removeFile = meta => {
    let options = {
      url: `/file/upload/${meta.id}-${meta.name}`,
      method: "delete"
    };

    return AXIOS(options);
  };

  handleChangeStatus = async ({ meta, file }, status) => {
    if (status === "preparing") {
      let uniqueId = uuidv4();
      meta.id = uniqueId;
    }

    //creating md5 hash of the file
    if (status === "getting_upload_params") {
      //New way to create chunks
      let filePart = "";
      let fileSize = file.size;

      let sentByte = 0;
      let chunkNumber = 0;
      while (sentByte < fileSize) {
        if (fileSize - sentByte >= 1000000) {
          filePart = file.slice(sentByte, sentByte + 1000000);
          sentByte += 1000000;
        } else {
          filePart = file.slice(sentByte, fileSize);
          sentByte += fileSize - sentByte;
        }

        chunkNumber++;

        let { data } = await this.uploadUsingAxios(
          filePart,
          chunkNumber,
          fileSize,
          meta
        );
        console.log("Server Response", data);
      }

      //concat the chunks
      meta["totalChunks"] = chunkNumber;
      let { data } = this.concatUsingAxios(meta);
      console.log("response after concat", data);

      // });
      //start the reading process.
      // myReader.readAsArrayBuffer(file);
    }
    // console.log("My reader as array buffer", myReader[0]);

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
          getUploadParams={this.uploadUsingAxios}
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
