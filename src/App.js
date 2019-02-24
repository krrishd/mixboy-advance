import React, { Component } from 'react';
import Sequencer from './Sequencer';
import { Timer } from 'easytimer.js';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    document.title = 'MIXBOY Advance'

    this.state = {
      currentTick: 0,
      ticker: new Timer(),
      bg: '#fff',
    }

    this.nextTick = this.nextTick.bind(this);
    this.resetTick = this.resetTick.bind(this);
    this.updateBackground = this.updateBackground.bind(this);
  }

  startTicking() {
    this.state.ticker.start();
    this.state.ticker.addEventListener('secondsUpdated', this.nextTick);
  }

  stopTicking() {
    this.state.ticker.stop();
  }

  nextTick() {
    if (this.state.currentTick === 7) {
      this.setState({
        currentTick: 0,
      });
    } else {
      this.setState({
        currentTick: this.state.currentTick + 1,
      })
    }
  }

  resetTick() {
    this.setState({
      currentTick: 0,
    });
  }

  updateBackground(noteLetter) {
    const bg = {
      C: 'linear-gradient(to right, #4286f4, #373B44)',
      D: 'linear-gradient(to right, #12c2e9, #c471ed, #f64f59)',
      E: 'linear-gradient(to right, #f12711, #f5af19)',
      F: 'linear-gradient(to right, #f12711, #f5af19)',
      G: 'linear-gradient(to right, #00f260, #0575e6)',
      A: 'linear-gradient(to right, #00f260, #0575e6)',
      B: 'linear-gradient(to right, #00f260, #0575e6)',
    }[noteLetter];

    this.setState({
      bg,
    });
  }

  render() {
    const rainbow = [
      '#ee8f8f',
      '#f0d777',
      '#94c7a3',
      '#9dd0e4',
      '#cfa1dd',
      '#ee8f8f',
      '#f0d777',
      '#94c7a3',
    ]

    const lights = Array
      .apply(null, Array(8))
      .map((item, index) => (index === this.state.currentTick) ? true : false)
      .map((on, index) => {
          if (on) {
            return <span className="light on fadeIn" />
          } else {
            return <span className="light off" style={{ background: rainbow[index] }} />;
          }
      });



    return (
      <div className="App">
        <header><h1 className="animated bounceInDown">MIXBOY Advance</h1></header>
        <Sequencer
          nextTick={this.nextTick}
          resetTick={this.resetTick}
          currentTick={this.state.currentTick}
          updateBackground={this.updateBackground}
        />
        <div className="Lights">
          {lights}
        </div>
      </div>
    );
  }
}

export default App;
