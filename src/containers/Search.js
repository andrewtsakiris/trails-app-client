import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";

import config from "../config";
import "./Search.css";

export default class Search extends Component {
  constructor(props) {
    super(props);


    this.state = {
      isLoading: null,
      content: ""
    };
  }

  validateForm() {
    return this.state.content.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleFileChange = event => {
    this.file = event.target.files[0];
  }

  handleSubmit = async event => {
    event.preventDefault();


    this.setState({ isLoading: true });
  }

  render() {
    return (
      <div className="Search">
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="content">
            <FormControl
              onChange={this.handleChange}
              value={this.state.content}
              componentClass="textarea"
            />
          </FormGroup>
          
        </form>
      </div>
    );
  }
}
