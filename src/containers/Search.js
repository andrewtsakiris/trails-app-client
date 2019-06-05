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

import logo from "./logo.png";

export default class Search extends Component {
  constructor(props) {
    super(props);
    let lastCity = localStorage.getItem("city");
    let lastState = localStorage.getItem("state");

    this.state = {
      longitude: "-76",
      latitude: "44",
      city: lastCity ? lastCity : "",
      state: lastState ? lastState: "",
      trails: [],
      userTrails: [],
      isLoading: false
    };
  }

  async updateUserTrails() {
    try {
      const userData = await API.get("trails", "/trails");
      console.log(userData);
      let userTrails = [];
      userData.forEach(entry => {
        userTrails.push({
          trailId: entry.trailId,
          trailStatus: entry.trailStatus,
          entryId: entry.entryId
        });
      });
      this.setState({ userTrails });
    } catch (e) {
      console.log("problem in update user trails")
      alert(e);
    }
  }
  async componentDidMount() {
    this.updateUserTrails();
    if(this.state.city) this.submit();
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
    if(event) event.preventDefault();
    this.submit();
    
    
    
    
  };

  submit = async () => {
    localStorage.setItem("city", this.state.city);
    localStorage.setItem("state", this.state.state);
    this.setState({isLoading: true});
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
      this.setState({isLoading: false});

  }

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

 

  findEntryId = (trail) => {
    let a = this.state.userTrails.find(thing => thing.trailId === trail.id);
    return a.entryId;

  }
  submitDelete = async (e, trail) => {
    try {
      await API.del("trails", `/trails/${this.findEntryId(trail)}`);
      this.updateUserTrails();
    } catch (e) {
      alert(e);
    }
    
  }

  renderList(t) {
    if (typeof t !== "undefined") {
      return (
        <div className="Trails">
          {t.length > 0 ? t.map(trail => (
            
            <Panel>
              <Panel.Heading>
                <Panel.Title>
                  <div className="headerGrid">
                      <div className="imgContainer">
                    <Image src={trail.imgSqSmall ? trail.imgSqSmall : logo }  fluid />
                    </div>
                    <div className="infoDiv">
                      <a href={trail.url}>{trail.name.length <= 34 ?
                      <p className="pTrailName">{trail.name}</p>
                      : <p className="pTrailName">{(trail.name).substring(0,34) + "..."}</p>
                    }</a>
                      <div className="subInfoDiv">
                      <p className="subInfo">{`Length: ${trail.length} mi`}</p>
                      <p className="subInfo">{`Elevation Gain: ${trail.ascent} ft`}</p>
                      <p className="subInfo">{`Rating: ${trail.stars}/5`}</p>
                      </div>
                      {this.isCompleted(trail) ? null :
                        !this.isSaved(trail) ? 
                        <Button
                          type="submit"
                          disabled={this.isDisabled(trail)}
                          onClick={e => this.submitSave(e, trail.id)}
                          className="iconButton"
                        >
                          <svg width="20" height="20" viewBox="0 0 32 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M14.7629 28.0347C15.1052 28.3348 15.5444 28.5 16 28.5C16.4553 28.5 16.8948 28.3348 17.2368 28.0352C18.5325 26.9009 19.7808 25.8358 20.8823 24.8963L20.8828 24.8959C24.106 22.1461 26.8895 19.7714 28.8264 17.4316C30.9917 14.8163 32 12.3363 32 9.62717C32 6.99498 31.0986 4.56662 29.4617 2.7891C27.8052 0.990554 25.532 0 23.0608 0C21.2136 0 19.522 0.584605 18.033 1.73744C17.2812 2.31936 16.6003 3.03154 16 3.86226C15.3999 3.03154 14.7188 2.31936 13.9673 1.73744C12.4783 0.584605 10.7866 0 8.93945 0C6.46802 0 4.19507 0.990554 2.53857 2.7891C0.901611 4.56662 0 6.99498 0 9.62717C0 12.3363 1.00854 14.8163 3.17383 17.4318C5.11084 19.7715 7.89478 22.1466 11.1187 24.8968L11.1243 24.9017C12.2239 25.8397 13.4702 26.9031 14.7629 28.0347ZM3.9165 4.06095C5.21411 2.65223 6.9978 1.87651 8.93945 1.87651C10.3616 1.87651 11.6675 2.32913 12.8206 3.22168C13.8484 4.01745 14.5642 5.0234 14.9836 5.72727C15.1995 6.08923 15.5793 6.30528 16 6.30528C16.4207 6.30528 16.8005 6.08923 17.0164 5.72727C17.436 5.0234 18.1519 4.01745 19.1794 3.22168C20.3325 2.32913 21.6384 1.87651 23.0608 1.87651C25.0022 1.87651 26.7861 2.65223 28.0835 4.06095C29.4004 5.49094 30.1257 7.46765 30.1257 9.62717C30.1257 11.9057 29.2798 13.9435 27.3833 16.2345C25.5517 18.447 22.8284 20.7706 19.675 23.461L19.6665 23.4683C18.5605 24.4114 17.3074 25.4807 15.9973 26.6228C14.6951 25.4829 13.4438 24.4153 12.3401 23.4737L12.3342 23.4688L12.3324 23.4672C9.17594 20.7743 6.44984 18.4486 4.61694 16.2345C2.72021 13.9435 1.87427 11.9057 1.87427 9.62717C1.87427 7.46765 2.59961 5.49094 3.9165 4.06095Z" fill="#6C6666"/>
                          </svg>
                          </Button>
                          : 
                          <Button type="submit" onClick={e => this.submitDelete(e, trail)} className="iconButton">
                          <svg width="20" height="20" viewBox="0 0 32 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M29.4614 2.7891C27.8049 0.990554 25.532 0 23.0608 0C21.2136 0 19.522 0.584605 18.0327 1.73744C17.2812 2.31936 16.6003 3.0313 16 3.86226C15.3999 3.03154 14.7188 2.31936 13.967 1.73744C12.478 0.584605 10.7864 0 8.93921 0C6.46802 0 4.19482 0.990554 2.53833 2.7891C0.901611 4.56662 0 6.99498 0 9.62717C0 12.3363 1.00854 14.8163 3.17383 17.4318C5.11084 19.7715 7.89478 22.1466 11.1187 24.8968C12.2195 25.836 13.4673 26.9006 14.7629 28.0347C15.1052 28.3348 15.5444 28.5 16 28.5C16.4553 28.5 16.8948 28.3348 17.2366 28.0352C18.5322 26.9009 19.7808 25.8358 20.8821 24.8961C24.1055 22.1463 26.8894 19.7715 28.8264 17.4316C30.9917 14.8163 32 12.3363 32 9.62693C32 6.99498 31.0984 4.56662 29.4614 2.7891Z" fill="#6C6666"/>
                          </svg> 
                          </Button>
                          

                          }
      


                        {this.isSaved(trail) ? null :
                          !this.isCompleted(trail) ?
                        <Button
                          type="submit"
                          disabled={this.isDisabled(trail)}
                          onClick={e => this.submitComplete(e, trail.id)}
                          className="iconButton"
                        > <svg width="20" height="20" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M17 33C25.8366 33 33 25.8366 33 17C33 8.16344 25.8366 1 17 1C8.16344 1 1 8.16344 1 17C1 25.8366 8.16344 33 17 33Z" fill="white" stroke="#6C6666" stroke-width="2"/>
                        <path d="M14.7565 26C14.5523 26 14.358 25.8988 14.2151 25.7229L8.2219 18.2971C7.92428 17.9287 7.92677 17.3342 8.225 16.9696C8.52634 16.602 9.00772 16.6058 9.30409 16.9734L14.7577 23.7318L25.6972 10.2752C25.9961 9.90828 26.4787 9.90828 26.7763 10.2752C27.0746 10.6413 27.0746 11.2357 26.7763 11.6026L15.2961 25.7252C15.1531 25.901 14.9589 26 14.7565 26Z" fill="#6C6666" stroke="#6C6666"/>
                        </svg> </Button> : 
                          <Button type="submit" onClick={e => this.submitDelete(e, trail)} className="iconButton">
                          <svg width="20" height="20" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M17 33C25.8366 33 33 25.8366 33 17C33 8.16344 25.8366 1 17 1C8.16344 1 1 8.16344 1 17C1 25.8366 8.16344 33 17 33Z" fill="#6C6666" stroke="#6C6666" stroke-width="2"/>
                          <path d="M14.7565 26C14.5523 26 14.358 25.8988 14.2151 25.7229L8.2219 18.2971C7.92428 17.9287 7.92677 17.3342 8.225 16.9696C8.52634 16.602 9.00772 16.6058 9.30409 16.9734L14.7577 23.7318L25.6972 10.2752C25.9961 9.90828 26.4787 9.90828 26.7763 10.2752C27.0746 10.6413 27.0746 11.2357 26.7763 11.6026L15.2961 25.7252C15.1531 25.901 14.9589 26 14.7565 26Z" fill="white" stroke="white"/>
                          </svg>
                          </Button>
                          
                          
                      }

                      
                      
                    </div>
                    
                    
                  </div>
                </Panel.Title>
                
                
                </Panel.Heading>
                <Panel.Body className="panelbody">
                
                
                {trail.summary !== "Needs Summary" && trail.summary.length > 3
                ? <p>{trail.summary} </p>
                : <p>No description available</p>}
                
                </Panel.Body>
             
            </Panel>
            
          )) : <h3>{this.state.isLoading ? "": "No trails found for that location"}</h3>}
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
              // componentClass="textarea"
              type="text"
              placeHolder="City/Town"
              style={{height:40}}
            />
          </FormGroup>
          
          <FormGroup controlId="state" >
            <FormControl
              onChange={this.handleChange}
              value={this.state.state}
              // componentClass="textarea"
              type="text"
              placeholder="State"
              style={{height:40}}
            />
          </FormGroup>
          <Button 
            block
            bsSize="large"
            type="submit"
            disabled={!this.verifyCoordinates()}
            id="findtrailsbutton"
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
