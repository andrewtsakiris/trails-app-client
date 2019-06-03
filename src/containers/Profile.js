import React, { Component } from "react";
import { PageHeader, ListGroup, ListGroupItem} from "react-bootstrap";
import "./Profile.css";
import { Link } from "react-router-dom";
import {API} from "aws-amplify";

export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      trails: []
    }
  }

  async componentDidMount() {
    try {
      const t = await API.get("trails", "/trails");
      console.log(t);
      this.setState({trails: t});
      console.log("api call to /trails didn't cause errors");
    } catch(e) {
      alert(e);
    }
  }

 

  renderTrailsList() {
    return (
      <p></p>
     
    )
    
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
