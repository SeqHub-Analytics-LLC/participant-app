# participant-app Dev Tutorial

This tutorial will walk you through the process to add your own experiment type to the app. Even though the tutorial covers some concepts of React and React-Redux, please read the Medium post below and the short YouTube video to get a better understanding of React and how Redux works with React. 

How React works: https://medium.com/leanjs/introduction-to-react-3000e9cbcd26#:~:text=What%20is%20React%3F,utilise%20it%20with%20other%20libraries

How Redux works: https://www.youtube.com/watch?v=nFryvdyMI8s&t=238s


## Table of Contents

- [Create a new Experiment Type](#create)
- [Experiment Configuration Format](#exptformat)
- [Actions Descriptions](#actions)

---

<a name="create"/>

### Create a new Experiment Type 

Jump to:

- [Connect your Component to Redux](#redux)
- [How Component State and Functions Interact](#interact)
- [Connect your Component to Experiment.js](#expt)
- [Conclusion](#conclusion)

Navigate to **/src/items** and open **Template.js**. You can build on this template and create your own experiment item. Follow the ```TODO``` tags to add more code. Note that this template is the bare minimum strucutre for a component to work with participant-app. You can always add more functions depending on what you need. 

Below is a walk-through of an example where we create a simple slider. Navigate to **/src/items/Slider.js** to see the file for this walk-through. 

##### *TIP: How do React components work?*

Your Experiment Type will be written into a React component. A React app consists of many components, and these components can talk to each other using ```props``` which stands for properties. When a parent component talks to a child component, it can pass ```props``` to the child component, and the child component can use these ```props```. We will see how this works in code in the section [Connect your Component to Experiment.js]. 

---

<a name="redux"/>

#### Connect your Component to Redux 

First, we need to import the following packages.
```sh
import React, { Component } from 'react';
import PropTypes from "prop-types";
import { connect } from "react-redux";
```
We will use ```PropTypes``` to call functions in **/src/actions/dataActions.js**. We will ```connect``` our ```Slider``` component to the aforementioned functions and React props. 

Let's first look at the functions and data you will be using in your component.
```sh
import {
  getExpt,
  storeAnswer
} from "../actions/dataActions";
```
```getExpt``` grabs a specific experiment's configuration data from a researcher's database. 

```storeAnswer``` saves a participant's response to Redux store. This action will be triggered when a participant completes each question. At the end of the survey, the participant's answers to all questions will be sent to the database using ```sendExpt```.

In order to use these two actions and data associated with these two actions, Redux requires us to implement the following code with ```PropTypes``` and ```connect```. Take a look at the end of our **Slider.js** file. 

```sh
Slider.propTypes = {
  getExpt: PropTypes.func.isRequired,
  expt: PropTypes.object.isRequired,
  storeAnswer: PropTypes.func.isRequired
}
```
We require functions  ```getExpt``` and ```storeAnswer```. The object ```expt``` includes an object ```dbInfo```. Here's an example of ```dbInfo```:
```sh
dbInfo: {
  db: 'Sean',
  col: 'study1-expt1'
}
```
```db``` is the name of the database from which we get our experiment configuration data.

```col``` contains two pieces of information: name of study and name of experiment. More detail on the organization of our MongoDB structure and API methods: [https://github.com/statistical-perceptions/demoAPI-v2]. The most important thing to know is that ```getExpt``` will take the content of ```dbInfo``` as parameters to get experiment configuration data from the database. 

The next few lines map ```state``` from Redux store to ```props``` that we can use in our component. Calling ```this.props.expt``` in our component is actually accessing the ```expt``` object in ```state```. The Redux structure requires us to write a mapping function like this. 
```sh
const mapStateToProps = state => ({
  expt: state.expt
})
```

The last few lines here serve to connect your component to the aforementioned functions and data. Note that our imported functions are wrapped in ```{}``` . 
```sh
export default connect(
  mapStateToProps,
  { getExpt, storeAnswer }
)(Slider); 
```

---

<a name="interact"/>

#### How Component State and Functions Interact

Take a look at ```constructor()``` and ```initialState()```.

The reason that we have an ```initialState``` is that we need to reset our component ```state``` to this ```initialState``` whenever our component is mounted (loaded up). When there are multiple questions of the same experiment type, we would want a fresh new state when the next question calls our ```Slider``` component. (The ```Slider``` component is called in **/src/components/Experiment.js**. We will cover this in the next section [Connect your Component to Experiment.js].)

```initialState``` includes:
```sh
submitted: false,
value: 0
```
```submitted``` is a ```Boolean``` that checks if a user has clicked on the "Ok" button. The function ```onSubmit()``` will set ```submitted``` to ```true```.

```value``` is a ```Number``` that stores the slider's position. When users drag the slider, they will trigger the function ```onChange()``` which will set ```value``` to the slider position. 

In the constructor, we also have a bunch of ```bind``` statements. Details on this can be found at https://reactjs.org/docs/handling-events.html. 

Now, take a look at ```showSlider()```. ```showSlider()``` displays the question for this specific experiment item, a simple range input (a slider), and the slider position. ```value``` points user input to ```this.state.value```, and ```onChange``` points to our ```onChange()``` function which set ```this.state.value``` to user input ```value```. Of course, you could have an incline anonymous function to handle ```onChange``` events, but generally speaking, having an ```onChange()``` is preferable because you can call the function if you add any other user input items that would require an ```onChange``` event. 

The component that you create will also need ```render()```. This tells React that we are rendering some HTML code. In our render method, we have a conditional statement. If ```this.state.submitted``` is false, then we will show our OK button which triggers ```onSubmit()```. This function will push user response to the Redux store, and switch ```this.state.submitted``` to true. Thus, when the component keeps refreshing and rendering, it will detect that ```this.state.submitted``` is now true, and it won't show the button. The purpose of the conditional statement is to force users to only submit one response per question. 

We have gone over all the functions that are self-contained in the ```Slider``` component. Now, let's discuss how the ```Slider``` component is incorporated into our app. 

---

<a name="expt"/>

#### Connect your Component to Experiment.js

Take a look at **/src/components/Experiment.js**. This file serves to create a survey-like flow for our app. It gets experiment config data from the database, talks to individual components, and decides if the next question is the last question. If the next question is the last question, ```Experiment``` will show a *Submit* button and directs users to ```Success``` page. If not, ```Experiment``` will display a child component. 

Now we will talk about how ```Experiment``` talks to its child components. 

First of all, in **Experiment.js**, we need to ```import Slider from "../items/Slider"```. Take a look at ```displayExpt()```. This function has a switch statement that tells the component which experiment type to display. After you make your own component, you need to add a ```case``` to detect your experiment type. You may follow the ```Slider``` case. 

Examine the following few lines in ```displayExpt()```:
```sh
const lowRange = expt[key]["lowRange"];
const highRange = expt[key]["highRange"];
const question = expt[key]["Question"];
<Slider childRef={ref => (this.childSlider = ref)}
    question={question} lowRange={lowRange} highRange={highRange} />
```
We use ```childRef``` to let the ```Experiment``` know that ```Slider``` is a child component. The anonymous function in the curly bracket simply means that we will call ```this.childSlider``` in our ```Experiment``` component whenever we want to refer to the ```Slider``` child component. For instance, look at ```onSubmit()```. The first line calls the ```resetState()``` method in the ```Slider``` component. This ensures that the state of our ```Slider``` component refreshes to a clean ```initialState``` whenever the component is called. You may see the following two functions in ```Slider```:
```
componentDidMount() {
const { childRef } = this.props;
childRef(this);
this.getData();
}

componentWillUnmount() {
const { childRef } = this.props;
childRef(undefined);
}
```
These two functions make sure that ```Slider``` knows that it's a child component. 

Take a closer look at ```question```, ```lowRange```, and ```highRange``` inside the ```Slider``` tag. These three properties are passed into ```Slider``` component as ```props```. When we want to access these values in **Slider.js**, we will simply call ```this.props.question```, ```this.props.lowRange```, and ```this.props.highRange```.

---

<a name="conclusion"/>

#### Conclusion
This is the end of the walk-through. If you get stuck somewhere, please use ```console.log``` to debug. If you have more questions about Redux, feel free to check out this YouTube video: [https://www.youtube.com/watch?v=93p3LxR9xfM&t=1534s].

---

<a name="exptformat"/>

#### Experiment Configuration Format
```
{
  exptName: "",
  q0: {
        Type: "",
        Question: "",
        ...      
      },
  q1: {
        Type: "",
        Question: "",
        ...      
      },
  ...
}
```

---

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `yarn build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
