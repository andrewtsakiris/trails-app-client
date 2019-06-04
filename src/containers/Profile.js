import React, { Component, Fragment } from "react";
import {
  PageHeader,
  ListGroup,
  ListGroupItem,
  Button,
  Thumbnail,
  Image,
  Panel,
  Glyphicon
} from "react-bootstrap";
import "./Profile.css";
import { Link } from "react-router-dom";
import { API } from "aws-amplify";
import { CognitoAccessToken } from "amazon-cognito-identity-js";
import { Col } from "reactstrap";
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
      stats: {},
      isLoading: false
    };
  }

  async componentDidMount() {
    try {
      this.setState({isLoading:true})
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
      this.setState({isLoading: false})
      this.updateStats();
    } catch (e) {
      alert(e);
    }
  }

  updateStats = () => {
    let numMiles = 0;
    let maxHeight = 0;
    let totalAscent = 0;
    let maxHeightHike = "";
    this.state.completedTrails.forEach(entry => {
      numMiles += entry.length;
      totalAscent += entry.ascent;
      if (entry.maxHeight > maxHeight) {
        maxHeight = entry.maxHeight;
        maxHeightHike = entry.name;
      }
    });
    let numHikes = this.state.completedTrails.length;
    this.setState({
      stats: { numMiles, numHikes, maxHeight, totalAscent, maxHeightHike }
    });
  };
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
        trailId: trail.trailId
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
        trailId: trail.trailId
      }
    });
    this.setState({});
  };

  renderTrailsList() {
    const imgurl =
      "https://cdn-files.apstatic.com/hike/7036619_sqsmall_1555022697.jpg";
    return (
      <Fragment>
        <h2>{this.state.isLoading ? "": "Your Saved Trails"}</h2>

        <div className="outerGrid" >
        {this.state.savedTrails.length < 1 ? (
          <p>{this.state.isLoading ? "": "No Saved Trails"}</p>
        ) : (
          this.state.savedTrails.map(trail => {
            return (
              <Panel>
                <Panel.Body >
                  <div className="myBody">
                  <div className="imageContainer">
                    <Image src={imgurl} fluid />
                  </div>
                  <div className="floatRight">
                    <p>{`${trail.name} - (${trail.length} mi, ${trail.ascent}ft gain)`}</p>
                    <p>{`Description: ${trail.description}`}</p>
                  </div>
                  <div className="buttonPanel">
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
                  </div>
                  </div>
                </Panel.Body>
              </Panel>
            );
          })
        )}
        </div>

        <h2>{this.state.isLoading ? "": "Your Completed Trails"}</h2>
        {this.state.isLoading ? <Glyphicon glyph="refresh" className="spinning" /> : <Fragment></Fragment>}
        <div className="outerGrid" >
        {this.state.completedTrails.length < 1 ? (
          <p>{this.state.isLoading ? "": "No Completed Trails"}</p>
        ) : (
          this.state.completedTrails.map(trail => {
            return (
              <Panel>
                <Panel.Body >
                  <div className="myBody">
                  <div className="imageContainer">
                    <Image src={imgurl} fluid />
                  </div>
                  <div className="floatRight">
                    <p>{`${trail.name} (${trail.length} mi)`}</p>
                    {`Comments: ${!trail.userComment ? "No Comment" : trail.userComment}`}
                    
                  </div>
                  <div className="buttonPanel">
                  
                  <Button
                    onClick={e =>
                      this.handleDelete(e, trail.entryId, trail.trailStatus)
                    }
                  >
                    Delete
                  </Button>
                  <CommentModal
                    trailName={trail.name}
                    trail={trail}
                    handleUpdateComment={this.handleUpdateComment}
                  />
                  </div>
                  </div>
                </Panel.Body>
              </Panel>
            );
          })
        )}
        </div>


      </Fragment>
    );
  }
  
  render() {
    return (
      <div className="Profile">
        <PageHeader>Profile Home</PageHeader>
        <Col className="leftcol">
          

          {this.renderTrailsList()}
        </Col>
        <Col className="rightcol">
          {this.state.isLoading ? <div></div>: 
          <div className="Stats">
          <h3 id="statstitle"> Stats </h3>
          <p className="Num">{this.state.stats.numHikes}</p> <p>Hikes Completed</p>
          <p className="Num">{`${Math.round(this.state.stats.numMiles*10)/10} mi`}</p> <p>Distance Hiked</p>
          <p className="Num">{`${this.state.stats.totalAscent} ft`}</p> <p>Total Ascent</p>
          <p className="Num">{`${this.state.stats.maxHeight} ft`}</p> <p>Peak Elevation</p>
          <Link to="/search">Find Trails</Link>
          </div>}
          
        </Col>
      </div>
    );
  }
}
