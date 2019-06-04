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
        ? <Navbar fluid >
        <Navbar.Brand>
        <svg viewBox="0 0 155 75" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* <Link to="/">  */}
            <path fill-rule="evenodd" clip-rule="evenodd" d="M0 71.7838C1.04561 71.6253 1.98134 70.8938 2.88129 70.179C4.67456 68.7548 8.75426 63.5065 10.9068 64.6413C11.3218 64.8599 11.6979 65.2196 12.1379 65.3219C12.626 65.4356 13.1196 65.217 13.5857 64.9963C18.0104 62.9014 24.0336 60.5939 27.5256 56.352C26.6706 61.738 24.2794 66.6813 20.9254 69.9978C29.6173 64.9602 36.703 55.3544 40.2425 43.8101C41.6361 45.6342 42.1871 48.2453 42.88 50.6591C46.8499 64.4808 57.5502 74.5179 68.829 75C64.0339 72.0011 59.74 67.6388 56.3329 62.3023C55.5914 61.1415 54.8554 59.7969 54.904 58.2851C54.9551 56.6843 55.8653 55.3818 56.7366 54.2558C62.1226 47.2978 68.1069 41.1341 74.5405 35.9173C74.0029 40.9429 72.4575 45.7773 70.1005 49.8072C71.277 47.7966 74.0106 46.587 75.4021 44.3002C77.0661 41.5661 78.2661 38.4 79.5355 35.3443C80.3307 33.4299 86.867 18.5658 89.1187 22.4554C89.7759 23.5901 89.5061 25.1942 89.2066 26.5629C86.451 39.163 83.6954 51.763 80.9399 64.3631C87.004 53.557 91.8037 41.5387 95.1215 28.855C95.7976 26.2707 96.9173 23.1454 99.0049 23.1447C100.994 23.1441 102.145 26.0126 102.869 28.4358C105.387 36.8494 108.282 45.255 112.869 52.0098C117.455 58.7651 124.007 63.7332 130.911 63.5052C124.705 60.8767 120.236 52.4531 120.524 43.9278C123.423 48.2252 126.324 52.5233 129.223 56.8214C131.198 59.7487 133.197 62.7042 135.633 64.9582C141.161 70.0734 148.256 71.0242 155 71.8125C143.75 67.0377 136.926 52.6222 130.103 39.9821C129.402 38.6822 128.646 37.3402 127.555 36.6375C126.702 36.0885 125.73 35.9862 124.791 35.7956C118.699 34.558 113.474 29.3345 109.412 23.2671C105.351 17.1998 102.196 10.1943 98.386 3.85349C97.3006 2.04612 95.9606 0.153839 94.2077 0.00874184C92.8432 -0.103592 91.583 0.886012 90.4392 1.86559C83.8968 7.47022 77.7933 13.9521 72.2561 21.1776C67.2887 27.6588 62.6602 34.8555 56.5337 39.3268C55.9695 39.738 55.3512 40.1365 54.7093 40.0456C53.8339 39.9219 53.195 38.9483 52.6262 38.0684C50.1364 34.2176 47.2091 30.8516 43.9706 28.1155C43.4468 27.6735 42.8785 27.2329 42.2555 27.2362C41.5753 27.2402 40.9697 27.7698 40.4224 28.298C38.1079 30.53 35.9875 33.107 34.115 35.9615C29.2356 43.4009 25.6199 54.1789 18.4841 58.499C15.6294 60.2268 12.8554 59.2165 9.85608 59.8838C5.64198 60.8212 2.69783 67.7244 0 71.7838Z" fill="white"/>
        {/* </Link> */}
        </svg>
        <Link to="/">OFF THE TRAILS</Link>
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse >
          <Nav pullRight className="rightNav">
            {/* add icon */}
            <Fragment >
              <Navbar.Text>{this.state.preferredName}</Navbar.Text>
              <NavItem onClick={this.handleLogout} className="navLogout">Logout</NavItem>
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
