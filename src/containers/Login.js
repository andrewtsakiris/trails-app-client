import React, { Component } from "react";
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./Login.css";
import { Link } from "react-router-dom";
import { Auth } from "aws-amplify";


export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: ""
    };
  }

  validateForm() {
    return this.state.username.length > 0 && this.state.password.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = async event => {
    event.preventDefault();
  
    try {
      await Auth.signIn(this.state.username, this.state.password);
      this.props.userHasAuthenticated(true);
      this.props.history.push("/");

    //   alert("Logged in");
    
    } catch (e) {
      alert(e.message);
    }
  }
  

  render() {
    return (
      <div className="Login">
          <p>Log IN bois</p>
          <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="username" bsSize="large">
            <ControlLabel>Username</ControlLabel>
            <FormControl
              autoFocus
              value={this.state.username}
              onChange={this.handleChange}
            />
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            <ControlLabel>Password</ControlLabel>
            <FormControl
              value={this.state.password}
              onChange={this.handleChange}
              type="password"
            />
          </FormGroup>
          <Button
            block
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
          >
            Login
          </Button>
        </form>
          <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
         
      </div>
    );
  }
}
