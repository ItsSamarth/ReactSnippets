import "./App.css";
import Login from "./views/Login";
import Navbars from "./component/navbar/Navbars";
import React, { Component } from "react";
import FileUploader from "./views/FileUploader";
import "react-dropzone-uploader/dist/styles.css";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: true
    };
  }

  toggleHide = () => {
    this.setState({
      show: !this.state.show
    });
  };

  render() {
    let { show } = this.state;
    return (
      <div>
        {/* {show && <Navbars />} */}
        {/* <Login toggleHide={this.toggleHide} /> */}
        <FileUploader />
      </div>
    );
  }
}
