import React from "react";
import { Popover, Button, Modal, FormGroup, FormControl } from "react-bootstrap";

export default class CommentModal extends React.Component {
  constructor(props) {
    super(props);

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);

    this.state = {
      show: false,
      text: this.props.trail.userComment
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
        <Button bsStyle="primary" bsSize="small" onClick={this.handleShow}>
          Edit Comment
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
