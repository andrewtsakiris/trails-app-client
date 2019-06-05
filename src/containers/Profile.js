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
import logo from "./logo.png";

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
            imgSqSmall: entry.imgSqSmall,
            stars: entry.stars
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
    const noSavedTrails = <div className="highmargin"><p className="italic noSavedTrails">No Saved Trails</p></div>;
    const findMoreTrails = <Link to="/search" className="findMoreTrails">Find more trails!</Link>;
    const noCompTrails = <div className="highmargin"><p className="italic noSavedTrails">No Completed Trails</p></div>;
    const compTitle = <div className="compTitle">
                      
                      <svg width="20" height="20" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" className="compIcon">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M17 33C25.8366 33 33 25.8366 33 17C33 8.16344 25.8366 1 17 1C8.16344 1 1 8.16344 1 17C1 25.8366 8.16344 33 17 33Z" fill="none" stroke="#6C6666" stroke-width="2"/>
                        <path d="M14.7565 26C14.5523 26 14.358 25.8988 14.2151 25.7229L8.2219 18.2971C7.92428 17.9287 7.92677 17.3342 8.225 16.9696C8.52634 16.602 9.00772 16.6058 9.30409 16.9734L14.7577 23.7318L25.6972 10.2752C25.9961 9.90828 26.4787 9.90828 26.7763 10.2752C27.0746 10.6413 27.0746 11.2357 26.7763 11.6026L15.2961 25.7252C15.1531 25.901 14.9589 26 14.7565 26Z" fill="#6C6666" stroke="#6C6666"/>
                        </svg>
                        <p className="comp">COMPLETED TRAILS</p>
                      </div>;
    const savedTitle = <div className="savedTitle">
    
    <svg width="20" height="20" viewBox="0 0 32 29" fill="none" xmlns="http://www.w3.org/2000/svg" className="savedIcon">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M14.7629 28.0347C15.1052 28.3348 15.5444 28.5 16 28.5C16.4553 28.5 16.8948 28.3348 17.2368 28.0352C18.5325 26.9009 19.7808 25.8358 20.8823 24.8963L20.8828 24.8959C24.106 22.1461 26.8895 19.7714 28.8264 17.4316C30.9917 14.8163 32 12.3363 32 9.62717C32 6.99498 31.0986 4.56662 29.4617 2.7891C27.8052 0.990554 25.532 0 23.0608 0C21.2136 0 19.522 0.584605 18.033 1.73744C17.2812 2.31936 16.6003 3.03154 16 3.86226C15.3999 3.03154 14.7188 2.31936 13.9673 1.73744C12.4783 0.584605 10.7866 0 8.93945 0C6.46802 0 4.19507 0.990554 2.53857 2.7891C0.901611 4.56662 0 6.99498 0 9.62717C0 12.3363 1.00854 14.8163 3.17383 17.4318C5.11084 19.7715 7.89478 22.1466 11.1187 24.8968L11.1243 24.9017C12.2239 25.8397 13.4702 26.9031 14.7629 28.0347ZM3.9165 4.06095C5.21411 2.65223 6.9978 1.87651 8.93945 1.87651C10.3616 1.87651 11.6675 2.32913 12.8206 3.22168C13.8484 4.01745 14.5642 5.0234 14.9836 5.72727C15.1995 6.08923 15.5793 6.30528 16 6.30528C16.4207 6.30528 16.8005 6.08923 17.0164 5.72727C17.436 5.0234 18.1519 4.01745 19.1794 3.22168C20.3325 2.32913 21.6384 1.87651 23.0608 1.87651C25.0022 1.87651 26.7861 2.65223 28.0835 4.06095C29.4004 5.49094 30.1257 7.46765 30.1257 9.62717C30.1257 11.9057 29.2798 13.9435 27.3833 16.2345C25.5517 18.447 22.8284 20.7706 19.675 23.461L19.6665 23.4683C18.5605 24.4114 17.3074 25.4807 15.9973 26.6228C14.6951 25.4829 13.4438 24.4153 12.3401 23.4737L12.3342 23.4688L12.3324 23.4672C9.17594 20.7743 6.44984 18.4486 4.61694 16.2345C2.72021 13.9435 1.87427 11.9057 1.87427 9.62717C1.87427 7.46765 2.59961 5.49094 3.9165 4.06095Z" fill="#6C6666"/>
    </svg>
    <p className="lefttitle">SAVED TRAILS</p>
    </div>;

    return (
      <Fragment>
        {this.state.isLoading ? "" : savedTitle}

        <div className="outerGrid">
          {this.state.savedTrails.length < 1 ? 
            this.state.isLoading ? null :  <Fragment>
              {noSavedTrails}
              {findMoreTrails} </Fragment>
           
           : (
            this.state.savedTrails.map(trail => {
              return (
                <Panel>
                  <Panel.Heading>
                    <Panel.Title>
                      <div className="headerGrid">
                        <div className="imgContainer">
                        <Image src={trail.imgSqSmall ? trail.imgSqSmall : logo }  fluid />
                        </div>
                        <div className="infoDiv">
                          {trail.name.length <= 34 ? (
                            <p className="pTrailName">{trail.name}</p>
                          ) : (
                            <p className="pTrailName">
                              {trail.name.substring(0, 34) + "..."}
                            </p>
                          )}
                          {/* <div className="subInfoDiv"> */}
                            <Row>
                              <p className="subInfo">{`Length: ${trail.length} mi`}</p>
                            </Row>
                            <Row>
                              <p className="subInfo">{`Elevation Gain: ${trail.ascent} ft`}</p>
                            </Row>
                            <Row>
                              <p className="subInfo">{`Rating: ${trail.stars}/5`}</p>
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
                            </Row>
                          {/* </div> */}
                        
                        
                        </div>
                      </div>
                    </Panel.Title>
                  </Panel.Heading>
                  <Panel.Body className="panelbody">
                    {!trail.description || trail.description.includes("Needs Summary") ? <p className="italic">No description available</p> : trail.description }
                  </Panel.Body>
                </Panel>


                
              );
            })
          )}
        </div>

        
        {this.state.isLoading ? "" : compTitle}
        {this.state.isLoading ? (
          <Glyphicon glyph="refresh" className="myGlyph" />
        ) : (
          <Fragment />
        )}
        <div className="outerGrid">
          {this.state.completedTrails.length < 1 ? 
            this.state.isLoading ? null :  <Fragment>
            {noCompTrails}
            {findMoreTrails} </Fragment>
              : (
            this.state.completedTrails.map(trail => {
              return (
                <Panel>
                  <Panel.Heading>
                    <Panel.Title>
                      <div className="headerGrid">
                        <div className="imgContainer">
                        <Image src={trail.imgSqSmall ? trail.imgSqSmall : logo }  fluid />
                        </div>
                        <div className="infoDiv">
                          {trail.name.length <= 34 ? (
                            <p className="pTrailName">{trail.name}</p>
                          ) : (
                            <p className="pTrailName">
                              {trail.name.substring(0, 34) + "..."}
                            </p>
                          )}
                          
                            <Row>
                            <p className="subInfo">{`Length: ${
                              trail.length
                            } mi`}</p> </Row>
                            <Row>
                            <p className="subInfo">{`Elevation Gain: ${
                              trail.ascent
                            } ft`}</p> </Row>

                          
                        <Row>
                              <p className="subInfo">{`Rating: ${trail.stars}/5`}</p>
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
                          id="commentButton"
                          trailName={trail.name}
                          trail={trail}
                          handleUpdateComment={this.handleUpdateComment}
                        />
                        </Row>
                      </div>
                      </div>
                    </Panel.Title>
                  </Panel.Heading>
                  <Panel.Body className="panelbody">
                    {!trail.userComment ||
                    trail.userComment.includes("No Comment")
                      ? <p className="italic">Add a Comment!</p>
                      : trail.userComment}
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
              <Row>
                <p id="statstitle">YOUR STATS</p>
              </Row>
              
              <Row>
                <Col>
                <p className="Num">{this.state.stats.numHikes}</p>{" "}
                </Col>
                <Col className="pStatsCol">
                <p className="pStats">hikes completed</p>
                </Col>
              </Row>
              <Row>
                <Col>
                <p className="Num">{`${Math.round(
                this.state.stats.numMiles * 10
              ) / 10} mi`}</p>{" "}
                </Col>
                <Col className="pStatsCol align-bottom">
                  <p className="pStats">distance hiked</p>
                </Col>
              </Row>
              <Row>
                <Col>
                  <p className="Num">{`${this.state.stats.totalAscent} ft`}</p>{" "}
                </Col>
                <Col className="pStatsCol">
                  <p className="pStats">total ascent</p>
                </Col>
              </Row>
              <Row>
                <Col>
                  <p className="Num">{`${this.state.stats.maxHeight} ft`}</p>{" "}
                </Col>
                <Col className="pStatsCol">
                  <p className="pStats align-bottom">peak elevation</p> 
                </Col>
              </Row>
              <Row>
                <Link to="/search">
                  <div className="divAddTrail">
                    <svg width="30" height="30" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="addTrailButton">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M32 64C49.6731 64 64 49.6731 64 32C64 14.3269 49.6731 0 32 0C14.3269 0 0 14.3269 0 32C0 49.6731 14.3269 64 32 64Z" fill="#72AFAD"/>
                      <path d="M32.5 17V49" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M48 33.5H16" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p >Add a new trail</p>
                  </div>
                </Link>
              </Row>
              
            </div>
          )}
        </Col>
      </div>
    );
  }
}
