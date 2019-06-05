import React from "react";
import { Popover, Button, Modal, FormGroup, FormControl } from "react-bootstrap";
// import "./CommentModal.css";

export default class CommentModal extends React.Component {
  constructor(props) {
    super(props);

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);

    this.state = {
      show: false,
      text: !this.props.trail.userComment || this.props.trail.userComment.includes("No Comment") ? "" : this.props.trail.userComment
    };
  }

  handleClose() {
    this.setState({ show: false });
    this.props.handleUpdateComment(this.props.trail, this.state.text);
  }

  handleShow() {
    this.setState({ show: true });
  }

  handleChange = event => {
    this.setState({text: event.target.value})
  }

  render() {
    return (
      <div>
        <Button bsStyle="primary" bsSize="small" onClick={this.handleShow} className="iconButton" classID="editButton">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.4767 3.27633L4.09521 19.6578L8.34165 23.9042L24.7231 7.52276L20.4767 3.27633Z" fill="#6C6666"/>
        <path d="M2.12354 25.8764L3.27662 20.4769L7.52305 24.7233L2.12354 25.8764Z" fill="#6C6666"/>
        <path d="M25.8763 2.12322C24.7037 0.950595 22.653 1.10013 21.2959 2.45722L25.5423 6.70366C26.8994 5.34657 27.049 3.29584 25.8763 2.12322Z" fill="#6C6666"/>
        </svg>



        </Button>
        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{this.props.trailName}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h5>{`Edit your comment for ${this.props.trailName} below:`}</h5>
            <FormGroup controlId="longitude">
              <FormControl
                onChange={this.handleChange}
                value={this.state.text}
                componentClass="textarea"
              />
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleClose}>Done</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
