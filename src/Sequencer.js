import React, { Component } from 'react';
import Embed from './Embed';
import { Timer } from 'easytimer.js';

const YOUTUBE_REGEX = RegExp(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/);

class Sequencer extends Component {
  constructor(props) {
    super(props);

    const params = (new URL(document.location)).searchParams;

    this.state = {
      url: params.get('url') || '',
      urlForEmbed: params.get('url') || null,
      embedProvider: params.get('url') ? 'yt' : null,
      listening: false,
      listenStart: null,
      listenEnd: null,
      notesPlayed: [],
      finalSequence: params.get('seq') ? JSON.parse(params.get('seq')) : null,
      play: false,
    };

    console.log(this.state);

    this.parseURL = this.parseURL.bind(this);
    this.recordNote = this.recordNote.bind(this);
  }

  record() {
    const t = new Timer();

    this.setState({
      listening: true,
      listenStart: new Date(),
      listenEnd: null,
      notesPlayed: [],
      finalSequence: null,
      play: false,
    }, () => {
      t.start({
        countdown: true,
        startValues: { seconds: 8 }
      });

      t.addEventListener('secondsUpdated', this.props.nextTick)

      t.addEventListener('targetAchieved', (e) => {
        this.setState({
          listening: false,
        }, () => {
          const millisecondsRecorded = 8000;
          const finalSequence = Array.apply(null, Array(32)).map(() => null);
          const buckets = finalSequence.map((bar, index) => (((index + 1)/32) * millisecondsRecorded));

          this.state.notesPlayed.forEach(note => {
            /* note: secondsIntoVideo, timePlayed */
            let placed = false;
            let bucketToTest = 0;
            while (!placed) {
              if (
                buckets[bucketToTest] > Math.abs(note.timePlayed - this.state.listenStart)
              ) {
                finalSequence[bucketToTest] = note.secondsIntoVideo;
                placed = true;
              } else {
                bucketToTest += 1;
              }
            }
          });

          this.setState({
            finalSequence,
          }, () => {
            window.history.pushState(null, null, `?url=${this.state.urlForEmbed}&seq=${JSON.stringify(finalSequence)}`);
          });
        });
      });
    });
  }

  recordNote(note) {
    /* note: secondsIntoVideo, timePlayed */
    if (this.state.listening) {
      const newNotesPlayed = this.state.notesPlayed;
      newNotesPlayed.push(note);
      this.setState({
        notesPlayed: newNotesPlayed,
      });
    }
  }

  parseURL(e) {
    e.preventDefault();

    let newState = {
      url: e.target.value,
    };

    if (YOUTUBE_REGEX.test(newState.url) || newState.url === '') {
      newState.urlForEmbed = newState.url;
      newState.embedProvider = "yt";
    }

    this.setState(newState);
  }

  render() {
    return (
      <div className="Sequencer">
        <input
          type="url"
          placeholder="Enter YouTube link here..."
          value={this.state.url}
          onChange={this.parseURL}
        />
        {
          this.state.urlForEmbed
            ? (
                <div className="machine animated bounceInUp">
                  <div className="buttons">
                    <button
                      className="record"
                      onClick={(e) => {
                        if (!this.state.listening) {
                          this.record();
                        }
                      }}
                    >{this.state.listening ? 'Recording...' : 'Record'}</button>
                    {
                      !this.state.listening && this.state.finalSequence
                        ? <button
                            className="play"
                            onClick={(e) => {
                              this.setState({
                                play: !this.state.play,
                              });
                            }}
                          >{this.state.play ? 'Stop' : 'Play'}</button>
                        : null
                    }
                  </div>
                  <Embed
                    url={this.state.urlForEmbed}
                    provider={this.state.embedProvider}
                    recordNote={this.recordNote}
                    play={this.state.play}
                    sequence={this.state.finalSequence}
                    updateBackground={this.props.updateBackground}
                    nextTick={this.props.nextTick}
                  />
              </div>
            )
            : <div className="empty"></div>
        }
      </div>
    )
  }
}

export default Sequencer;