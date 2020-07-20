import React, { Component } from 'react';
import axios from "axios";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import { 
  getExpt,
  sendExpt,
  isFinalQ,
  storeAnswer
} from "../actions/dataActions";

import Slider from "../items/Slider"

class Experiment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0
    }

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onFinalSubmit = this.onFinalSubmit.bind(this);
    this.whichSubmit = this.whichSubmit.bind(this);
  }

  componentDidMount() {
    this.getData();

    const username = this.props.match.params.username;
    const expt = this.props.match.params.expt;
    if (!this.props.expt.participantID) {
      alert("Please enter your unique ID");
      this.props.history.push("/" + username + "/" + expt);
    }
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  onSubmit() {
    const username = this.props.match.params.username;
    const expt = this.props.match.params.expt;

    // checking if the next question is the final question 
    const currentQ = this.props.match.params.qKey.charAt(1);
    const nextQ = Number(currentQ) + 1;
    const lastQ = this.props.expt.questionKeys[this.props.expt.questionKeys.length - 1];
    if (nextQ == Number(lastQ.charAt(1))) {
      this.props.isFinalQ(true);
    }

    // put answer into store. 
    const question = this.props.expt.exptToDisplay[this.props.match.params.qKey]["Question"];
    this.props.storeAnswer(question, this.state.value);
    this.props.history.push("/" + username + "/" + expt + 
      "/q" + nextQ.toString());

    // storing the lowest range of the next question for UIUX purposes 
    // not modular
    const nextQMin = this.props.expt.exptToDisplay["q" + nextQ.toString()]["lowRange"];
    this.setState({ value: nextQMin })
  }

  onFinalSubmit() {
    const username = this.props.match.params.username;
    const expt = this.props.match.params.expt;

    const question = this.props.expt.exptToDisplay[this.props.match.params.qKey]["Question"];
    this.props.storeAnswer(question, this.state.value);
    this.props.history.push("/" + username + "/" + expt + "/success");
  }

  whichSubmit() {
    return (
      <div>
        {
          !this.props.expt.isFinalQ ? 
          <input type="submit" className="btn" value="Confirm and Next Question"
            onClick={this.onSubmit}/> :
          <div>
            This is the final question. <p></p>
            <input type="submit" className="btn" value="Submit"
              onClick={this.onFinalSubmit}/>
          </div>
        }
      </div>
    )
  }

  getData() {
    const username = this.props.match.params.username;
    // there will be problems if user's study name / experiment name inclues "-"
    const studyName = this.props.match.params.expt.split("-")[0];
    const exptName = this.props.match.params.expt.split("-")[1];
    this.props.getExpt(username, studyName, exptName);
  }

  displayExpt() {
    const expt = this.props.expt.exptToDisplay;
    const key = this.props.match.params.qKey;
    console.log(expt);
    if (expt[key]) {
      // NEED TO make each if statement modular
      // a map here on a list of documents of experiment types (each document
      // contains experiment parameters) to match expt[key]["Type"] 
      // with "slider"
      if (expt[key]["Type"] == "slider") {
        const lowRange = expt[key]["lowRange"];
        const highRange = expt[key]["highRange"];
        const question = expt[key]["Question"];
        return (
          <div className="container">
            {/* {question} <br/>
            <input 
              type="range" 
              min={lowRange} 
              max={highRange}
              name="value"
              value={this.state.value}
              onChange={this.onChange}
            />
            {this.state.value} */}
            <Slider 
              question={question} lowRange={lowRange} 
              highRange={highRange} />
            <br/>
            <this.whichSubmit />
          </div>
        )
      }
      // add more if statements here for other experiments types
      // follow the format of the slider if statement
    }
  }

  sendData(finalData) {
    const username = this.props.match.params.username;
    const exptName = this.props.match.params.expt;
    const API_URL = 'https://test-api-615.herokuapp.com/api/feedback/' +
      username + '/' + exptName;
    axios
      .post(API_URL, finalData)
      .then(res => {
        console.log(res);
        alert("You have successfully submitted your response.");
      })
  }

  render() {
    const exptName = this.props.match.params.expt;
    const participant = this.props.expt.participantID;
    return (
      <div className="container">
      Experiment name: <br/>
      <b>{exptName}</b>
      <br/>
      Participant ID: <br/>
      <b>{participant}</b>
      <br/><br/>
      {this.displayExpt()}
    </div>
    )
  }
}

Experiment.propTypes = {
  getExpt: PropTypes.func.isRequired,
  expt: PropTypes.object.isRequired,
  participantID: PropTypes.string.isRequired,
  sendExpt: PropTypes.func.isRequired,
  isFinalQ: PropTypes.func.isRequired,
  storeAnswer: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  expt: state.expt,
  participantID: state.participantID
})

export default connect(
  mapStateToProps,
  { getExpt, sendExpt, isFinalQ, storeAnswer }
)(Experiment);
