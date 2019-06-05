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
import { Col, Row } from "reactstrap";
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
      this.setState({ isLoading: true });
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
            maxHeight: entry.high,
            imgSqSmall: entry.imgSqSmall
          };
          if (item.trailStatus === "saved") {
            savedTrails.push(toAdd);
          } else {
            completedTrails.push(toAdd);
          }
        });
      }
      this.setState({ savedTrails, completedTrails });
      this.setState({ isLoading: false });
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
        <h2>{this.state.isLoading ? "" : "Your Saved Trails"}</h2>

        <div className="outerGrid">
          {this.state.savedTrails.length < 1 ? (
            <p>{this.state.isLoading ? "" : "No Saved Trails"}</p>
          ) : (
            this.state.savedTrails.map(trail => {
              return (
                <Panel>
                  <Panel.Heading>
                    <Panel.Title>
                      <div className="headerGrid">
                        <div className="imgContainer">
                          <Image src={trail.imgSqSmall} fluid />
                        </div>
                        <div className="infoDiv">
                          {trail.name.length <= 34 ? (
                            <p className="pTrailName">{trail.name}</p>
                          ) : (
                            <p className="pTrailName">
                              {trail.name.substring(0, 34) + "..."}
                            </p>
                          )}
                          <div className="subInfoDiv">
                            <p className="subInfo">{`Length: ${
                              trail.length
                            } mi`}</p>
                            <p className="subInfo">{`Elevation Gain: ${
                              trail.ascent
                            } ft`}</p>
                          </div>
                        
                        <Button className="iconButton"
                          onClick={e =>
                            this.handleDelete(
                              e,
                              trail.entryId,
                              trail.trailStatus
                            )
                          }
                        >
                          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="18" cy="18" r="17" fill="white" stroke="#6C6666" stroke-width="2"/>
                          <line x1="10.4142" y1="10" x2="25.9706" y2="25.5563" stroke="#6C6666" stroke-width="2" stroke-linecap="round"/>
                          <line x1="11" y1="25.5563" x2="26.5563" y2="10" stroke="#6C6666" stroke-width="2" stroke-linecap="round"/>
                          </svg>

                        </Button>
                        <Button className="iconButton"
                          onClick={e => this.handleMakeCompleted(e, trail)}
                        >
                          <svg width="20" height="20" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M17 33C25.8366 33 33 25.8366 33 17C33 8.16344 25.8366 1 17 1C8.16344 1 1 8.16344 1 17C1 25.8366 8.16344 33 17 33Z" fill="white" stroke="#6C6666" stroke-width="2"/>
                          <path d="M14.7565 26C14.5523 26 14.358 25.8988 14.2151 25.7229L8.2219 18.2971C7.92428 17.9287 7.92677 17.3342 8.225 16.9696C8.52634 16.602 9.00772 16.6058 9.30409 16.9734L14.7577 23.7318L25.6972 10.2752C25.9961 9.90828 26.4787 9.90828 26.7763 10.2752C27.0746 10.6413 27.0746 11.2357 26.7763 11.6026L15.2961 25.7252C15.1531 25.901 14.9589 26 14.7565 26Z" fill="#6C6666" stroke="#6C6666"/>
                          </svg>
                        </Button>
                        </div>
                      </div>
                    </Panel.Title>
                  </Panel.Heading>
                  <Panel.Body className="panelbody">
                    {!trail.description ? "No description available" : trail.description }
                  </Panel.Body>
                </Panel>


                
              );
            })
          )}
        </div>

        <h2>{this.state.isLoading ? "" : "Your Completed Trails"}</h2>
        {this.state.isLoading ? (
          <Glyphicon glyph="refresh" className="spinning" />
        ) : (
          <Fragment />
        )}
        <div className="outerGrid">
          {this.state.completedTrails.length < 1 ? (
            <p>{this.state.isLoading ? "" : "No Completed Trails"}</p>
          ) : (
            this.state.completedTrails.map(trail => {
              return (
                <Panel>
                  <Panel.Heading>
                    <Panel.Title>
                      <div className="headerGrid">
                        <div className="imgContainer">
                          <Image src={trail.imgSqSmall} fluid />
                        </div>
                        <div className="infoDiv">
                          {trail.name.length <= 34 ? (
                            <p className="pTrailName">{trail.name}</p>
                          ) : (
                            <p className="pTrailName">
                              {trail.name.substring(0, 34) + "..."}
                            </p>
                          )}
                          <div className="subInfoDiv">
                            <p className="subInfo">{`Length: ${
                              trail.length
                            } mi`}</p>
                            <p className="subInfo">{`Elevation Gain: ${
                              trail.ascent
                            } ft`}</p>
                          </div>
                        
                        <Button className="iconButton"
                          onClick={e =>
                            this.handleDelete(
                              e,
                              trail.entryId,
                              trail.trailStatus
                            )
                          }
                        >
                          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="18" cy="18" r="17" fill="white" stroke="#6C6666" stroke-width="2"/>
                          <line x1="10.4142" y1="10" x2="25.9706" y2="25.5563" stroke="#6C6666" stroke-width="2" stroke-linecap="round"/>
                          <line x1="11" y1="25.5563" x2="26.5563" y2="10" stroke="#6C6666" stroke-width="2" stroke-linecap="round"/>
                          </svg>

                        </Button>
                        <CommentModal 
                        // className="iconButton"
                          trailName={trail.name}
                          trail={trail}
                          handleUpdateComment={this.handleUpdateComment}
                        />
                      </div>
                      </div>
                    </Panel.Title>
                  </Panel.Heading>
                  <Panel.Body className="panelbody">
                    {!trail.userComment ||
                    trail.userComment.includes("No Comment")
                      ? "No Comment"
                      : `Your Comment: ${trail.userComment}`}
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
        {/* <PageHeader>Profile Home</PageHeader> */}
        <Col className="leftcol">{this.renderTrailsList()}</Col>
        <Col className="rightcol">
          {this.state.isLoading ? (
            <div />
          ) : (
            <div className="Stats">
              <h3 id="statstitle">Your Stats </h3>
              <Row>
                <Col>
                <p className="Num">{this.state.stats.numHikes}</p>{" "}
                </Col>
                <Col className="pStatsCol">
                <p className="pStats">Hikes Completed</p>
                </Col>
              </Row>
              <Row>
                <Col>
                <p className="Num">{`${Math.round(
                this.state.stats.numMiles * 10
              ) / 10} mi`}</p>{" "}
                </Col>
                <Col className="pStatsCol align-bottom">
                  <p className="pStats">Distance Hiked</p>
                </Col>
              </Row>
              <Row>
                <Col>
                  <p className="Num">{`${this.state.stats.totalAscent} ft`}</p>{" "}
                </Col>
                <Col className="pStatsCol">
                  <p className="pStats">Total Ascent</p>
                </Col>
              </Row>
              <Row>
                <Col>
                  <p className="Num">{`${this.state.stats.maxHeight} ft`}</p>{" "}
                </Col>
                <Col className="pStatsCol">
                  <p className="pStats align-bottom">Peak Elevation</p> 
                </Col>
              </Row>
              <Link to="/search">
                <div>
                  <p>Add a new trail</p>
                  
                  <svg width="30" height="30" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M32 64C49.6731 64 64 49.6731 64 32C64 14.3269 49.6731 0 32 0C14.3269 0 0 14.3269 0 32C0 49.6731 14.3269 64 32 64Z" fill="#72AFAD"/>
                    <path d="M32.5 17V49" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M48 33.5H16" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                

              </Link>
            </div>
          )}
        </Col>
      </div>
    );
  }
}
