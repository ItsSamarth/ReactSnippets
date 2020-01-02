import "./App.css";
import Login from "./views/Login";
import Navbars from "./component/navbar/Navbars";
import React, { Component } from "react";
import FileUploader from "./views/FileUploader";
import "react-dropzone-uploader/dist/styles.css";
import TestUpload from "./views/TestUpload";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

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
        {/* <FileUploader /> */}
        {/* <TestUpload /> */}
        <Router>
          <Switch>
            <Route path="/" exact component={FileUploader} />
            <Route path="/test" component={TestUpload} />
          </Switch>
        </Router>
      </div>
    );
  }
}
