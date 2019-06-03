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
import { API } from "aws-amplify";

export default class Search extends Component {
  constructor(props) {
    super(props);

    this.state = {
      longitude: "-76",
      latitude: "44",
      trails: [],
      userTrails: []
    };
  }

  async updateUserTrails() {
    try {
      const userData = await API.get("trails", "/trails");
      
      let userTrails = [];
      userData.forEach((entry) => {
        userTrails.push({
          trailId: entry.trailId,
          trailStatus: entry.trailStatus
        });
      })
      this.setState({userTrails});
    }
    catch (e) {
      alert(e);
    }
  }
  async componentDidMount() {
    
    this.updateUserTrails();
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
    fetch(url)
      .then(response => response.json())
      .then(data => this.setState({ trails: data }));
  };

  submitSave = async (event,id) => {
    try {
      await API.post("trails", "/trails", {
        body: {
          trailStatus: "saved",
          trailId: id,
          userComment: "No Comment"
        }
        
      });
      this.updateUserTrails();
    }
    catch (e) {
      alert(e);
    }
    
  };

  submitComplete = async (event, id) => {
    try {
      await API.post("trails", "/trails", {
        body: {
          trailStatus: "completed",
          trailId: id,
          userComment: "No Comment"
        }
      });
      this.updateUserTrails();
    } catch (e) {
      alert(e);
    }
  };

  isDisabled = trail => {
    return this.isSaved(trail) || this.isCompleted(trail);
  }

  isSaved = trail => {
    if(this.state.userTrails.find(element => element.trailId === trail.id && element.trailStatus === "saved")){
      return true;
    }
    return false;
  }

  isCompleted = trail => {
    if(this.state.userTrails.find(element => element.trailId === trail.id && element.trailStatus === "completed")){
      return true;
    }
    return false;

  }



  renderList(t) {
    if (typeof t.trails !== "undefined") {
      return (
        <ListGroup>
          {t.trails.map(trail => (
            <ListGroupItem header={`${trail.name} (${trail.length} mi) - Rating: ${trail.stars}/5`}>
              {trail.summary !== "Needs Summary" && trail.summary.length > 3
                ? trail.summary
                : "No description available"}
              <Button text={this.isDisabled(trail)? "Saved" : "Save"}type="submit" disabled={this.isDisabled(trail)} onClick={(e) => this.submitSave(e,trail.id)}>
              {this.isSaved(trail)? "Saved" : "Save"} </Button>
              <Button type="submit" disabled={this.isDisabled(trail)} onClick={(e) => this.submitComplete(e, trail.id)}>
              {this.isCompleted(trail)? "Completed" : "Complete"}
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
