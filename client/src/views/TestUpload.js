import React, { Component } from "react";
import axios from "axios";

export default class TestUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileSelected: null,
      uploadId: "",
      fileName: "",
      backendUrl: "http://localhost:8080/api/test",
      failedChunks: []
    };
  }

  uploadRemainingParts = async () => {
    let { failedChunks } = this.state;
    console.log("Internet Connected", failedChunks);
    let totalFailedChunks = failedChunks.length;

    //If there is no chunks to upload then return
    if (totalFailedChunks === 0) {
      console.log("No chunks to upload");
      return;
    }

    let index = 0;
    let promisesArray = [];
    while (totalFailedChunks > index) {
      let { url, data, headers } = failedChunks[index].reason.config;
      // Send part aws server
      let uploadResp = axios.put(url, data, {
        headers
      });
      promisesArray.push(uploadResp);
      index++;
    }

    let resolvedArray = await Promise.allSettled(promisesArray);

    //extract failed request
    let retryRequestArr = [];
    for (let i = 0; i < resolvedArray.length; i++) {
      if (resolvedArray[i].status === "rejected") {
        console.log("Failed request is:", i, resolvedArray[i].reason.config);
        retryRequestArr.push(resolvedArray[i]);
      }
    }

    //if failed chunks
    if (retryRequestArr.length > 0) {
      let tempArr = [...retryRequestArr];
      console.log("Temp array of failed request", tempArr);
      await this.setState({
        failedChunks: tempArr
      });
    } else {
      let completeMultipartRes = this.completeMultipart(resolvedArray);
      console.log(completeMultipartRes, "complete upload response");
    }
  };

  componentDidMount = () => {
    window.addEventListener("offline", () => console.log("No Internet"));
    window.addEventListener("online", this.uploadRemainingParts.bind(this));
  };

  componentWillUnmount() {
    window.removeEventListener("offline", () =>
      console.log(" Removed No Internet")
    );
    window.removeEventListener("online", this.uploadRemainingParts.bind(this));
  }

  async fileHandler(event) {
    try {
      let fileSelected = event.target.files[0];
      let fileName = fileSelected.name;
      this.setState({ fileSelected });
      this.setState({ fileName });
    } catch (err) {
      console.error(err, err.message);
    }
  }

  async startUpload(event) {
    try {
      event.preventDefault();
      const params = {
        fileName: this.state.fileName,
        fileType: this.state.fileSelected.type
      };

      let resp = await axios.get(`${this.state.backendUrl}/start-upload`, {
        params
      });
      let { uploadId } = resp.data;
      this.setState({ uploadId });
      this.uploadMultipartFile();
    } catch (err) {
      console.log(err);
    }
  }

  async completeMultipart(resolvedArray) {
    let uploadPartsArray = [];
    resolvedArray.forEach((resolvedPromise, index) => {
      uploadPartsArray.push({
        ETag: resolvedPromise.value.headers.etag,
        PartNumber: index + 1
      });
    });

    // CompleteMultipartUpload in the backend server
    let completeUploadResp = await axios.post(
      `${this.state.backendUrl}/complete-upload`,
      {
        params: {
          fileName: this.state.fileName,
          parts: uploadPartsArray,
          uploadId: this.state.uploadId
        }
      }
    );

    return completeUploadResp;
    // console.log(completeUploadResp.data, "complete upload response");
  }

  processFailedChunks = resolvedArray => {};

  //function to solve promise all reject problem
  allSkippingErrors = promises => {
    console.log("called with new reuqst", promises);
    return Promise.all(promises.map(p => p.catch(error => null)));
  };

  async uploadMultipartFile() {
    try {
      const CHUNK_SIZE = 5242880; // 10MB //5mb 5242880 5 << 20
      const fileSize = this.state.fileSelected.size;
      const CHUNKS_COUNT = Math.floor(fileSize / CHUNK_SIZE) + 1;
      let promisesArray = [];
      let start, end, blob;

      for (let index = 1; index < CHUNKS_COUNT + 1; index++) {
        start = (index - 1) * CHUNK_SIZE;
        end = index * CHUNK_SIZE;
        blob =
          index < CHUNKS_COUNT
            ? this.state.fileSelected.slice(start, end)
            : this.state.fileSelected.slice(start);

        // Get presigned URL for each part
        var { fileName, uploadId } = this.state;
        let getUploadUrlResp = await axios.get(
          `${this.state.backendUrl}/get-upload-url`,
          {
            params: {
              fileName: this.state.fileName,
              partNumber: index,
              uploadId: this.state.uploadId
            }
          }
        );

        let { presignedUrl } = getUploadUrlResp.data;
        console.log(
          "   Presigned URL " +
            index +
            ": " +
            presignedUrl +
            " filetype " +
            this.state.fileSelected.type
        );

        // Send part aws server
        let uploadResp = axios.put(presignedUrl, blob, {
          headers: {
            "Content-Type": this.state.fileSelected.type
          }
        });
        promisesArray.push(uploadResp);
      }

      console.log("promises array", promisesArray);
      let resolvedArray = await Promise.allSettled(promisesArray);
      // let resolvedArray = await this.allSkippingErrors(promisesArray);
      console.log(resolvedArray, " resolvedAr");

      //extract failed request
      let retryRequestArr = [];
      for (let i = 0; i < resolvedArray.length; i++) {
        if (resolvedArray[i].status === "rejected") {
          console.log("Failed request is:", i, resolvedArray[i].reason.config);
          retryRequestArr.push(resolvedArray[i]);
        }
      }

      let { failedChunks } = this.state;
      let tempArr = [...failedChunks, ...retryRequestArr];
      console.log("Temp array of failed request", tempArr);
      await this.setState({
        failedChunks: tempArr
      });

      //cause we have failed parts
      if (retryRequestArr.length > 0) {
        return;
      }

      // let newResponseArray = this.processFailedChunks();

      let completeMultipartRes = this.completeMultipart(resolvedArray);

      console.log(completeMultipartRes, "complete upload response");
    } catch (err) {
      console.log(err);
    }
  }

  render() {
    return (
      <div>
        <form onSubmit={this.startUpload.bind(this)}>
          <div>
            <p>Upload Dataset:</p>
            <input
              type="file"
              id="file"
              accept=".jpeg,.png,.jpg,.mp4"
              onChange={this.fileHandler.bind(this)}
            />
            <button type="submit">Upload</button>
          </div>
        </form>
      </div>
    );
  }
}
