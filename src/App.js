import React, { Component, Fragment } from "react";
import { Link, withRouter } from "react-router-dom";
import { Navbar, NavItem, Nav } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import "./App.css";
import Routes from "./Routes";
import { Auth } from "aws-amplify";



class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      isAuthenticated: false,
      preferredName: "User"
    };
  }

  updateName = name => {
    this.setState({preferredName: name})
  }
  async componentDidMount() {
    try {
      await Auth.currentSession();
      this.userHasAuthenticated(true);
    }
    catch(e) {
      if (e !== 'No current user') {
        alert(e);
      }
    }
  
    this.setState({ isAuthenticating: false });
  }
  
  userHasAuthenticated = authenticated => {
    this.setState({
      isAuthenticated: authenticated
    });
  } 
  handleLogout = async event => {
    await Auth.signOut();
    this.userHasAuthenticated(false);
    this.props.history.push("/login");
  }
  render() {
    const childProps = {
      isAuthenticated: this.state.isAuthenticated,
      userHasAuthenticated: this.userHasAuthenticated,
      updateName: this.updateName
    };
    return (
      <div className="App container">
        {this.state.isAuthenticated
        ? <Navbar fluid collapseOnSelect>
        <Navbar.Brand>
          <Link to="/">Off the Trails🌲</Link>
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse >
          <Nav pullRight>
            {/* add icon */}
            <Fragment>
              <Navbar.Text>{this.state.preferredName}</Navbar.Text>
              <NavItem onClick={this.handleLogout}>Logout</NavItem>
            </Fragment>
          
          </Nav>
          
        </Navbar.Collapse>
    </Navbar>
        : <p id="hiddenP" hidden></p>

        }
        
        <Routes childProps={childProps} />
      </div>
    );
  }
}

export default withRouter(App);
