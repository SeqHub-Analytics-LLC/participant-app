import React, { Component } from 'react';
import PropTypes from "prop-types";
import { connect } from "react-redux";

import {
  getExpt,
  storeAnswer
} from "../actions/dataActions";

// This component should do the following:
// - Display question
// - Display an experiment item (in this case, a slider)
// - Store answer into Redux store upon submission 
class Slider extends Component {
  constructor(props) {
    super(props);
    // this.state = {
    //   submitted: false,
    //   // question: this.props.question,
    //   // lowRange: this.props.lowRange,
    //   // highRange: this.props.highRange,
    //   value: 0,
    // }
    this.state = this.initialState;

    this.onChange = this.onChange.bind(this);
    this.showSlider = this.showSlider.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.resetState = this.resetState.bind(this);
  }

  get initialState() {
    return {
      submitted: false,
      value: 0
    };
  }

  resetState() {
    this.setState(this.initialState);
  }

  componentDidMount() {
    const { childRef } = this.props;
    childRef(this);
    this.getData();
  }

  componentWillUnmount() {
    const { childRef } = this.props;
    childRef(undefined);
   }

  getData() {
    const db = this.props.expt.dbInfo.db;
    // there will be problems if user's study name / experiment name inclues "-"
    const studyName = this.props.expt.dbInfo.col.split("-")[0];
    const exptName = this.props.expt.dbInfo.col.split("-")[1];
    this.props.getExpt(db, studyName, exptName);
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  showSlider() {
    return (
      <div className="container">
        {this.props.question} <br/>
        <input 
          type="range"
          min={this.props.lowRange}
          max={this.props.highRange}
          name="value"
          value={this.state.value}
          onChange={this.onChange}
        />
        {this.state.value} <br/>
        {
          !this.state.submitted && 
          <input type="submit" className="btn" value="Ok"
            onClick={this.onSubmit}/>
        }
      </div>
    )
  }

  // part of template: 
  onSubmit() {
    const question = this.props.question;
    // put answer in our redux store to be sent via API later
    this.props.storeAnswer(question, this.state.value);
    this.setState({ submitted: true });
  }

  render() {
    return (
      <div>
        {this.showSlider()} <br/>
      </div>
    )
  }
}

Slider.propTypes = {
  getExpt: PropTypes.func.isRequired,
  expt: PropTypes.object.isRequired,
  storeAnswer: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  expt: state.expt
})

export default connect(
  mapStateToProps,
  { getExpt, storeAnswer }
)(Slider);