import React, { Component } from 'react';
import PropTypes from "prop-types";
import { connect } from "react-redux";

/**
 * A preview version for researchers. 
 * Note that data is never submitted to API. 
 */
class PreviewSuccess extends Component {
  componentDidMount() {
    // console.log(this.props);
    const username = this.props.expt.dbInfo.db;
    const expt = this.props.expt.dbInfo.col;
    if (!this.props.expt.answer.length == 0) {
      const finalObj = {
        participantID: this.props.expt.participantID
      }
      this.props.expt.answer.map(entry => {
        finalObj[entry.que] = entry.ans
      })
      console.log(finalObj);
    }
  }

  render() {
    const link = this.props.expt.exptToDisplay.link;
    const participantID = this.props.expt.participantID;
    return (
      <div className="container">
        <h1>Thank you for your submission!</h1> <br/>
        You are <b>67%</b> done with the experiment! Now you will need to:  <br/><br/>
        1. Please copy your ID shown below: <br/>
        <b>{participantID}</b> <br/> 
        2. Please click on this <a href={link} target="_blank">link</a>, paste your ID in the first page and complete the final survey. 
      </div>
    )
  }
}

PreviewSuccess.propTypes = {
  expt: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  expt: state.expt,
})

export default connect(
  mapStateToProps,
  { }
)(PreviewSuccess);
