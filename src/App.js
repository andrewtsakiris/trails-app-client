import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Navbar, NavItem, Nav } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import "./App.css";
import Routes from "./Routes";

class App extends Component {
  render() {
    return (
      <div className="App container">
        <Navbar fluid collapseOnSelect>
            <Navbar.Brand>
              <Link to="/">Trail Hero 🤪🌲</Link>
            </Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse >
              <Nav pullRight>
                {/* add icon */}
              <Navbar.Text>USERNAME</Navbar.Text>
              <LinkContainer to="/login">
                  <NavItem>Logout</NavItem>
                </LinkContainer>
                
              </Nav>
              
            </Navbar.Collapse>
        </Navbar>
        <Routes />
      </div>
    );
  }
}

export default App;
