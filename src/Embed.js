import React, { Component } from 'react';
import YouTube from 'react-youtube';
import superagent from 'superagent';
import { Timer } from 'easytimer.js';
import WebMidi from 'webmidi';

class Embed extends Component {
  constructor(props) {
    super(props);
    
    this._onReady = this._onReady.bind(this);
    this.isCurrentlyPlaying = this.isCurrentlyPlaying.bind(this);

    this.state = {
      ytVideo: null,
      sliceIncrement: 1,
      play: false,
      playerInterval: null,
      width: 640,
      height: 390,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.play) {
      let i = 0;
      this.state.video.playVideo();

      this.setState({
        playerInterval: setInterval(() => {
          if (this.props.sequence[i] !== null) {
            this.state.video.playVideo();
            this.state.video.seekTo(this.props.sequence[i]);
          }

          if (i === 31) {
            i = 0;
          } else {
            i += 1;
          }
        }, 250),
      });
    } else {
      clearInterval(this.state.playerInterval);
    }
  }

  isCurrentlyPlaying() {
    return this.state.play;
  }

  _onReady(event) {
    const playerInterval = this.state.playerInterval;
    const isCurrentlyPlaying = this.isCurrentlyPlaying;
    const updateBackground = this.props.updateBackground;

    this.setState({
      video: event.target,
    }, () => {
      const durationInSeconds = this.state.video.getDuration();
      const video = this.state.video;
      const sliceIncrement = durationInSeconds / 24;

      if (!this.state.play) {
        const recordNote = this.props.recordNote;
    
        WebMidi.enable(function (err) {
          if (err || !WebMidi.inputs[0]) {
            console.log("WebMidi could not be enabled.", err);
          } else {
            console.log("WebMidi enabled!");
            this.controller = WebMidi.inputs[0];
    
            this.controller.addListener('noteon', 'all', (e) => {
              if (playerInterval) {
                clearInterval(this.state.playerInterval);
              }

              if (isCurrentlyPlaying() === true) {
                // do nothing
              } else {
                const noteNumber = e.note.number;

                updateBackground(e.note.name[0]);

                let secondsIntoVideo = (noteNumber - 48) * sliceIncrement;
                
                video.playVideo();
                video.seekTo(secondsIntoVideo);
                
                recordNote({
                  secondsIntoVideo,
                  timePlayed: new Date(),
                });
              }
            });
          }
        });
      }
    });
  }

  render() {
    if (this.props.provider === "yt") {
      const videoId = this.props.url.split('?v=')[1];

      return (
        <div className="Embed">
          <YouTube
            videoId={videoId}
            opts={{
              width: window.screen.width * 0.6,
              height: (390/640) * (window.screen.width * 0.6)
            }}
            onReady={this._onReady}
          />
        </div>
      )
    }
  }
}

export default Embed;
