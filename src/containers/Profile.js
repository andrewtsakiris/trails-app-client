import React, { Component, Fragment } from "react";
import { PageHeader, ListGroup, ListGroupItem, Button} from "react-bootstrap";
import "./Profile.css";
import { Link } from "react-router-dom";
import { API } from "aws-amplify";
import { CognitoAccessToken } from "amazon-cognito-identity-js";
import {Col} from "reactstrap";
import CommentModal from "../components/CommentModal";

/*
  savedTrails and completedTrails have: userComment, trailId, entryId, length, ascent, trailStatus, name, maxHeight
*/
export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      savedTrails: [],
      completedTrails: [],
      stats: {}
    };
  }

  async componentDidMount() {
    try {
      const t = await API.get("trails", "/trails");
      let idurl = "";
      t.forEach(entry => {
        idurl = idurl.concat(`${entry.trailId},`);
      });
      idurl = idurl.substring(0, idurl.length - 1);
      let savedTrails = [];
      const completedTrails = [];
      if (idurl.length > 5) {
        const url = `https://www.hikingproject.com/data/get-trails-by-id?ids=${idurl}&key=200480158-4a1a03c6d4e52f1867f9e2bc486de6a3`;

        let myData = [];
        await fetch(url)
          .then(response => response.json())
          .then(data => {
            myData = data.trails;
          });

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
            description: entry.summary,
            maxHeight: entry.high
          };
          if (item.trailStatus === "saved") {
            savedTrails.push(toAdd);
          } else {
            completedTrails.push(toAdd);
          }
        });
      }
      this.setState({ savedTrails, completedTrails });
      this.updateStats();
    } catch (e) {
      alert(e);
    }
  }

  updateStats = () => {
    let numMiles = 0;
    let maxHeight = -1000;
    let totalAscent = 0;
    let maxHeightHike = "";
    this.state.completedTrails.forEach((entry) => {
      numMiles += entry.length;
      totalAscent += entry.ascent;
      if(entry.maxHeight > maxHeight) {
        maxHeight = entry.maxHeight;
        maxHeightHike = entry.name;
      }
    });
    let numHikes = this.state.completedTrails.length;
    this.setState({stats: {numMiles, numHikes, maxHeight, totalAscent, maxHeightHike}});
  }
  handleDelete = async (event, entryId, trailStatus) => {
    try {
      console.log(trailStatus);
      await API.del("trails", `/trails/${entryId}`);
      if (trailStatus === "saved") {
        this.setState({
          savedTrails: this.state.savedTrails.filter(
            element => element.entryId !== entryId
          )
        });
      } else {
        this.setState({
          completedTrails: this.state.completedTrails.filter(
            element => element.entryId !== entryId
          )
        });
      }
      this.updateStats();
    } catch (e) {
      alert(e);
    }
  };

  handleMakeCompleted = async (event, trail) => {
    await API.put("trails", `/trails/${trail.entryId}`, {
      body: {
        userComment: trail.userComment,
        trailStatus: "completed",
        trailId: trail.trailId,
      }
    });
    trail.trailStatus = "completed";
    this.setState({
      savedTrails: this.state.savedTrails.filter(
        element => element.entryId !== trail.entryId
      ),
      completedTrails: this.state.completedTrails.concat(trail)
    });
    this.updateStats();
  };

  handleUpdateComment = async (trail, newComment) => {
    trail.userComment = newComment;
    await API.put("trails", `/trails/${trail.entryId}`, {
      body: {
        userComment: newComment,
        trailStatus: "completed",
        trailId: trail.trailId,
      }
    });
    this.setState({});
  }
  renderTrailsList() {
    
    return (
      <Fragment>
        <h2>Your Saved Trails</h2>
        {this.state.savedTrails.length < 1 ? <p>No Saved Trails</p> : 
        <ListGroup>
          {this.state.savedTrails.map(trail => {
            return (
              <ListGroupItem header={`${trail.name} - (${trail.length} mi)`}>
                {`Description: ${trail.description}`}
                <Button
                  onClick={e =>
                    this.handleDelete(e, trail.entryId, trail.trailStatus)
                  }
                >
                  Unsave
                </Button>
                <Button onClick={e => this.handleMakeCompleted(e, trail)}>
                  Mark Completed
                </Button>
              </ListGroupItem>
            );
          })}
        </ListGroup>}
        <h2>Your Completed Trails</h2>
        {this.state.completedTrails.length < 1 ? <p>No Completed Trails</p> : 
        <ListGroup>
          {this.state.completedTrails.map(trail => {
            return (
              <ListGroupItem header={`${trail.name} - (${trail.length} mi)`}>
                {`Comments: ${trail.userComment}`}
                <Button
                  onClick={e =>
                    this.handleDelete(e, trail.entryId, trail.trailStatus)
                  }
                >
                  Delete
                </Button>
                <CommentModal trailName={trail.name} trail={trail} handleUpdateComment={this.handleUpdateComment}/>
              </ListGroupItem>
            );
          })}
        </ListGroup>}
      </Fragment>
    );
  }
  render() {
    return (
      
      <div className="Profile">
        <PageHeader>Your Profile Home Page</PageHeader>
        <Col className="leftcol">
          <Link to="/search">Find Trails</Link>
          
          {this.renderTrailsList()}
        </Col>
        <Col className="rightcol">
          <h3> Stats </h3>
          <h5>{`${this.state.stats.numHikes} Hikes Completed`}</h5>
          <h5>{`${this.state.stats.numMiles} Miles Hiked`}</h5>
          <h5>{`${this.state.stats.totalAscent} Feet Ascended`}</h5>
          <h5>{`Highest Elevation: ${this.state.stats.maxHeight} ft (${this.state.stats.maxHeightHike})`}</h5>
          
        </Col>
        
        
      </div>
    );
  }
}
