import React, { Component } from "react";
import { PageHeader, ListGroup } from "react-bootstrap";
import "./Profile.css";
import { Link } from "react-router-dom";
import {API} from "aws-amplify";

export default class Profile extends Component {
  render() {
    return (
      <div className="Profile">
        <Link to="/search">Find Trails</Link>
        <PageHeader>Your Profile Home Page</PageHeader>
      </div>
    );
  }
}
