import React, { Component } from "react";
import Dropzone from "react-dropzone-uploader";
import AXIOS from "../utils/api";
import axios from "axios";

export default class FileUploader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadingImages: {},
      dataUnsaved: true,
      uploadingPercentage: {
        filename: 0
      }
    };
  }

  getPresignedUrl = meta => {
    let options = {
      url: "http://localhost:8080/api/s3/presigned",
      method: "post",
      data: meta
    };
    return AXIOS(options);
  };

  uploadToAws = (signedUrl, file) => {
    console.log("File type", file);
    // let options = {
    //   url: signedUrl,
    //   method: 'post',
    // }

    let formData = new FormData();
    formData.append("fileId", file);
    let options = {
      url: signedUrl,
      method: "put",
      data: formData,
      headers: {
        "Content-Type": file.type,
        "X-Requested-With": "XMLHttpRequest"
      },
      onUploadProgress: progressEvent => {
        let name = `'${file.name}'`;
        let { uploadingPercentage } = this.state;
        uploadingPercentage[name] = progressEvent.loaded;
        this.setState({
          uploadingPercentage
        });

        let newmeta = {
          meta: {
            status: "uploading",
            progress: "40"
          }
        };
        // this.handleChangeStatus(newmeta, "uploading");
        console.log(progressEvent.loaded, this.state);
      }
    };

    return AXIOS(options);
    // return axios.put(signedUrl, file, options);
  };

  getUploadParams = async ({ meta, file }) => {
    // console.log("Get uplod params", meta, file);

    try {
      let { data } = await this.getPresignedUrl(meta);
      console.log("Presigned url data", data);

      let ans = await this.uploadToAws(data, file);
      console.log("ans", ans);
    } catch (err) {
      console.error(err);
    }
    // const { fields, uploadUrl, fileUrl } = {
    //   fields: {
    //     AWSAccessKeyId: "AKIAI3V7H4N4QZBYTENQ",
    //     acl: "public-read",
    //     key: "files/test.txt",
    //     policy:
    //       "eyJleHBpcmF0aW9uIjogIjIwMTgtMTAtMzBUMjM6MTk6NDdaIiwgImNvbmRpdGlvbnMiOiBbeyJhY2wiOiAicHVibGljLXJlYWQifSwgWyJjb250ZW50LWxlbmd0aC1yYW5nZSIsIDEwLCAzMTQ1NzI4MF0sIHsiYnVja2V0IjogImJlYW10ZWNoLWZpbGUifSwgeyJrZXkiOiAiY29tcGFueS8zLzg5Nzg5NDg2LWQ5NGEtNDI1MS1hNDJkLTE4YWY3NTJhYjdkMi10ZXN0LnR4dCJ9XX0=",
    //     signature: "L7r3KBtyOXjUKy31g42JTYb1sio="
    //   },
    //   fileUrl: "https://tmtload.s3.ap-south-1.amazonaws.com/files/test.txt",
    //   uploadUrl: "https://tmtload.s3.ap-south-1.amazonaws.com/"
    // };
    // console.log(fields, fileUrl, uploadUrl);
    // return { meta: meta.fileUrl, url: data };
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

  getFileChunk = file => {};

  sendFiles = () => {
    console.log("Send files logs");
    console.log(this.state.activeFileQueue);
    let { pendingFileQueue } = this.state;

    while (pendingFileQueue.length > 0) {
      //check for the new file queue
      pendingFileQueue = this.state.pendingFileQueue;

      // Get pending chunks and active file queue
      let { pendingChunkQueue, activeFileQueue } = this.state;

      while (pendingChunkQueue.length < 10 && pendingFileQueue.length != 0) {
        //pop the file and push it to the active file queue
        let newFile = pendingFileQueue.slice(0, 1);

        // get the chunks of the file
        let chunks = this.getFileChunk(newFile);

        // update chunks in the queue
        this.setState({
          pendingChunkQueue: pendingChunkQueue.concat(chunks)
        });
      }
    }
  };

  handleChangeStatus = ({ meta }, status) => {
    console.log(status, meta);
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
