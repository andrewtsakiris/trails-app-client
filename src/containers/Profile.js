import React, { Component } from "react";
import { PageHeader, ListGroup } from "react-bootstrap";
import "./Profile.css";
import { Link } from "react-router-dom";
import {API} from "aws-amplify";

export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      completedTrails: [],
      savedTrails: []
    };
  }

  async componentDidMount() {
    try {
      const completedTrails = API.get("trails", "listtrails/completed");
      const savedTrails = API.get("trails", "trails/saved");
      this.setState({
        completedTrails,
        savedTrails
      });
    } catch(e) {

    }
  }

  renderList(sTrails, cTrails) {
    return (
      0
    );
  }

  render() {
    return (
      <div className="Profile">
        <Link to="/search">Find Trails</Link>
        <PageHeader>Your Profile Home Page</PageHeader>
        {this.renderList(this.state.savedTrails, this.state.completedTrails)}
      </div>
    );
  }
}
