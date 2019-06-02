import React, { Component } from "react";
import {
  FormGroup,
  Form,
  FormControl,
  ControlLabel,
  Button,
  ListGroup,
  ListGroupItem
} from "react-bootstrap";

import config from "../config";
import "./Search.css";

export default class Search extends Component {
  constructor(props) {
    super(props);

    this.state = {
      longitude: "-76",
      latitude: "44",
      trails: []
    };
  }

  validateForm() {
    return this.state.content.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  handleFileChange = event => {
    this.file = event.target.files[0];
  };

  handleSubmit = async event => {
    event.preventDefault();
    const url = `https://www.hikingproject.com/data/get-trails?lat=${
      this.state.latitude
    }&lon=${
      this.state.longitude
    }&maxDistance=10&key=200480158-4a1a03c6d4e52f1867f9e2bc486de6a3`;
    console.log(url);
    fetch(url)
      .then(response => response.json())
      .then(data => this.setState({ trails: data }));
  };

  submitSave = event => {
    console.log("save press");
  };

  submitComplete = event => {
    console.log("complete press");
  };

  renderList(t) {
    if (typeof t.trails !== "undefined") {
      return (
        <ListGroup>
          {t.trails.map(trail => (
            <ListGroupItem
              header={`${trail.name} (${trail.length} mi) - Rating: ${
                trail.stars
              }/5`}
            >
              {trail.summary !== "Needs Summary" && trail.summary.length > 3
                ? trail.summary
                : "No description available"}

              <Button type="submit" onClick={this.submitSave}>
                Save
              </Button>
              <Button type="submit" onClick={this.submitComplete}>
                Mark Complete
              </Button>
            </ListGroupItem>
          ))}
        </ListGroup>
      );
    }
    return <p> No trails found </p>;
  }

  render() {
    return (
      <div className="Search">
        <form onSubmit={this.handleSubmit}>
          <ControlLabel>Longitude</ControlLabel>
          <FormGroup controlId="longitude">
            <FormControl
              onChange={this.handleChange}
              value={this.state.longitude}
              componentClass="textarea"
            />
          </FormGroup>
          <ControlLabel>Latitude</ControlLabel>
          <FormGroup controlId="latitude">
            <FormControl
              onChange={this.handleChange}
              value={this.state.latitude}
              componentClass="textarea"
            />
          </FormGroup>
          <Button block bsSize="large" type="submit">
            Find
          </Button>
        </form>
        {this.renderList(this.state.trails)}
      </div>
    );
  }
}
