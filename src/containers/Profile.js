import React, { Component } from "react";
import "./Profile.css";
import { Link } from "react-router-dom";

export default class Profile extends Component {
  render() {
    return (
      <div className="Profile">
        <div className="lander">
          <h1>Trail Hero</h1>
          <p>get out there</p>
          <Link to="/search">Find Trails</Link>
        </div>
      </div>
    );
  }
}
