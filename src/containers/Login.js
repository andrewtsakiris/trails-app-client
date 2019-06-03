import React, { Component } from "react";
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import { Container, Col, Row } from 'reactstrap';
import "./Login.css";
import { Link } from "react-router-dom";
import { Auth } from "aws-amplify";


export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: ""
    };
  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = async event => {
    event.preventDefault();
  
    try {
      await Auth.signIn(this.state.email, this.state.password);
      this.props.userHasAuthenticated(true);
      this.props.history.push("/");

    //   alert("Logged in");
    
    } catch (e) {
      alert(e.message);
    }
  }
  

  render() {
    return (
      <Container className="fill" fluid>
          <Col className="leftCol">
          <svg fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect fill="#323D27" fillOpacity="0.3" stroke="#979797"/>
          </svg>

          </Col>
          <Col className="Login" align="center">
            <h1>Login</h1>
            <form onSubmit={this.handleSubmit}>
              <FormGroup controlId="email" bsSize="large">
                <ControlLabel>Email</ControlLabel>
                <FormControl
                  autoFocus
                  value={this.state.email}
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
            <p className="text-center">
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
          </Col>
        
      </Container>
          
         
      // </div>
    );
  }
}
