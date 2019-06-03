import React, { Component, Fragment } from "react";
import { PageHeader, ListGroup, ListGroupItem, Button } from "react-bootstrap";
import "./Profile.css";
import { Link } from "react-router-dom";
import { API } from "aws-amplify";
import { CognitoAccessToken } from "amazon-cognito-identity-js";

/*
  savedTrails and completedTrails have: userComment, trailId, entryId, length, ascent, trailStatus, name
*/
export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      savedTrails: [],
      completedTrails: []
    };
  }

  findMatchingTrail(trails, id) {}
  async componentDidMount() {
    try {
      const t = await API.get("trails", "/trails");
      let idurl = "";
      t.forEach(entry => {
        idurl = idurl.concat(`${entry.trailId},`);
      });
      idurl = idurl.substring(0, idurl.length - 1);
      console.log(idurl);
      const url = `https://www.hikingproject.com/data/get-trails-by-id?ids=${idurl}&key=200480158-4a1a03c6d4e52f1867f9e2bc486de6a3`;
      //console.log(t);
      let myData = [];
      await fetch(url)
        .then(response => response.json())
        .then(data => {
          myData = data.trails;
        });
      let savedTrails = [];
      const completedTrails = [];
      myData.forEach(entry => {
        let id = entry.id;
        let item = t.find(element => element.trailId == entry.id);
        let toAdd = {
          name: entry.name,
          userComment: item.userComment,
          ascent: entry.ascent,
          trailId: item.trailId,
          length: entry.length,
          trailStatus: item.trailStatus,
          entryId: item.entryId,
          description: entry.description
        };
        if (item.trailStatus === "saved") {
          savedTrails.push(toAdd);
        } else {
          completedTrails.push(toAdd);
        }
      });
      this.setState({ savedTrails, completedTrails });
    } catch (e) {
      alert(e);
    }
  }

  handleDelete = (event, entryId, trailStatus) => {
    try {
      console.log(trailStatus)
      API.del("trails", `/trails/${entryId}`);
      if(trailStatus === "saved") {
        this.setState({savedTrails: this.state.savedTrails.filter(element => element.entryId !== entryId)})
      }
      else {
        this.setState({completedTrails: this.state.completedTrails.filter(element => element.entryId !== entryId)})
      }
    } catch (e) {
      alert(e);
    }
  }

  handleMakeCompleted = (event, trail) => {
    API.put("trails", `/trails/${trail.entryId}`, {
      body: {
        userComment: trail.userComment,
        trailStatus: "completed"
      }
    });
    trail.trailStatus = "completed";
    this.setState({
      savedTrails: this.state.savedTrails.filter(element => element.entryId !== trail.entryId),
      completedTrails: this.state.completedTrails.concat(trail)
    })
  }

  renderTrailsList() {
    return (
      <Fragment>
        <h2>Your Saved Trails</h2>
        <ListGroup>
          {this.state.savedTrails.map(trail => {
            return (
              <ListGroupItem header={`${trail.name} - (${trail.length} mi)`}>
                {`Description: ${trail.description}`}
                <Button onClick={(e) => this.handleDelete(e, trail.entryId, trail.trailStatus)}>
                  Delete
                </Button>
                <Button onClick={(e) => this.handleMakeCompleted(e, trail)} >
                  Mark Completed
                </Button>
              </ListGroupItem>
            );
          })}
        </ListGroup>
        <h2>Your Completed Trails</h2>
        <ListGroup>
          {this.state.completedTrails.map(trail => {
            return (
              <ListGroupItem header={`${trail.name} - (${trail.length} mi)`}>
                {`Comments: ${trail.userComment}`}
                <Button onClick={(e) => this.handleDelete(e, trail.entryId, trail.trailStatus)}>
                  Delete
                </Button>
              </ListGroupItem>
            );
          })}
        </ListGroup>
      </Fragment>
    );
  }
  render() {
    return (
      <div className="Profile">
        <Link to="/search">Find Trails</Link>
        <PageHeader>Your Profile Home Page</PageHeader>
        {this.renderTrailsList()}
      </div>
    );
  }
}
