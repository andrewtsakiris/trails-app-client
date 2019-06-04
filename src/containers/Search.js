import React, { Component } from "react";
import {
  FormGroup,
  Form,
  FormControl,
  ControlLabel,
  Button,
  ListGroup,
  ListGroupItem,
  Panel,
  Image
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
      city: "",
      state: "",
      trails: [],
      userTrails: []
    };
  }

  async updateUserTrails() {
    try {
      const userData = await API.get("trails", "/trails");

      let userTrails = [];
      userData.forEach(entry => {
        userTrails.push({
          trailId: entry.trailId,
          trailStatus: entry.trailStatus
        });
      });
      this.setState({ userTrails });
    } catch (e) {
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
    
    

    const formattedCity = this.state.city.trim().replace(" ", "+");
    const mapsurl = `https://maps.googleapis.com/maps/api/geocode/json?address=${formattedCity},+${this.state.state}&key=AIzaSyA3BWuqTKTB3rFEn29WxJya6jrbop69nVk`
    await fetch(mapsurl).then(response => response.json()).then(data => {
      var latitude = data.results[0].geometry.location.lat;
      var longitude = data.results[0].geometry.location.lng;
      this.setState({latitude, longitude});
    }).catch(e => alert("Location not recognized"));
    const url = `https://www.hikingproject.com/data/get-trails?lat=${
      this.state.latitude
    }&lon=${
      this.state.longitude
    }&maxDistance=10&key=200480158-4a1a03c6d4e52f1867f9e2bc486de6a3`;
    await fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.trails.length > 0) {
          this.setState({ trails: data.trails });
        }
        else {
          this.setState({trails: []});
        }
      });

    
  };

  submitSave = async (event, id) => {
    try {
      await API.post("trails", "/trails", {
        body: {
          trailStatus: "saved",
          trailId: id,
          userComment: "No Comment"
        }
      });
      this.updateUserTrails();
    } catch (e) {
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
  };

  isSaved = trail => {
    if (
      this.state.userTrails.find(
        element =>
          element.trailId === trail.id && element.trailStatus === "saved"
      )
    ) {
      return true;
    }
    return false;
  };

  isCompleted = trail => {
    if (
      this.state.userTrails.find(
        element =>
          element.trailId === trail.id && element.trailStatus === "completed"
      )
    ) {
      return true;
    }
    return false;
  };

  renderList(t) {
    if (typeof t !== "undefined") {
      return (
        <div className="Trails">
          {t.length > 0 ? t.map(trail => (
            
            <Panel>
              <Panel.Heading>
                <Panel.Title>
                {trail.name}
                </Panel.Title>
                
                </Panel.Heading>
                <Panel.Body className="panelbody">
                <p>{`Length: ${trail.length} mi`}</p>
                <p>{`Elevation Gain: ${trail.ascent} ft`}</p>
                <p>{`Rating: ${trail.stars}/5`}</p>
                {trail.summary !== "Needs Summary" && trail.summary.length > 3
                ? <p>{`Description: ${trail.summary}`} </p>
                : <p>No description available</p>}
                
                </Panel.Body>
             
              <Panel.Footer>
              
              {this.isCompleted(trail) ? null : 
              <Button
                type="submit"
                disabled={this.isDisabled(trail)}
                onClick={e => this.submitSave(e, trail.id)}
              >
                {this.isSaved(trail) ? "Saved" : "Save"}{" "}
              </Button> }


              {this.isSaved(trail) ? null :
              <Button
                type="submit"
                disabled={this.isDisabled(trail)}
                onClick={e => this.submitComplete(e, trail.id)}
              >
                {this.isCompleted(trail) ? "Completed" : "Mark Complete"}
              </Button>}
              </Panel.Footer>
            </Panel>
            
          )) : <h3>No trails found for that location</h3>}
        </div>
      );
    }
    return <p> No trails found </p>;
  }

  verifyCoordinates = () => {
    return true;
  };

  render() {
    return (
      <div className="Search">
        <div className="HeaderBox">
        <h2>Search Trails Nearby</h2>
        
        <form onSubmit={this.handleSubmit}>
          <div className="searchTools">
          
          <FormGroup controlId="city" >
            <FormControl
              onChange={this.handleChange}
              value={this.state.city}
              componentClass="textarea"
              placeHolder="City/Town"
              style={{height:40}}
            />
          </FormGroup>
          
          <FormGroup controlId="state" >
            <FormControl
              onChange={this.handleChange}
              value={this.state.state}
              componentClass="textarea"
              placeholder="State"
              style={{height:40}}
            />
          </FormGroup>
          <Button 
            block
            bsSize="large"
            type="submit"
            disabled={!this.verifyCoordinates()}
          >
            Find Trails
          </Button>
          </div>
        </form>
        </div>
        <div className="TrailsContainer">
          {this.renderList(this.state.trails)}
        </div>
      </div>
    );
  }
}
