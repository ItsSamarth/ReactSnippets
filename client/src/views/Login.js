import React, { Component } from "react";
import { Button } from "reactstrap";

export default class Login extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1>Welcome, Username</h1>
        <Button outline color="primary" onClick={this.props.toggleHide}>
          primary
        </Button>{" "}
      </div>
    );
  }
}
