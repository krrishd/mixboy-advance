import React, { Component } from 'react';
import YouTube from 'react-youtube';
import WebMidi from 'webmidi';

class Embed extends Component {
  constructor(props) {
    super(props);
    
    this._onReady = this._onReady.bind(this);
    this.state = {
      ytVideo: null,
      sliceIncrement: 1,
    }
  }

  _onReady(event) {
    const durationInSeconds = event.target.getDuration();
    
    const video = event.target;
    const sliceIncrement = durationInSeconds / 24;

    WebMidi.enable(function (err) {
      if (err) {
        console.log("WebMidi could not be enabled.", err);
      } else {
        console.log("WebMidi enabled!");
        this.controller = WebMidi.inputs[0];

        this.controller.addListener('noteon', 'all', (e) => {
          console.log(e);
          const noteNumber = e.note.number;
          let timestampToPlay = (noteNumber - 48) * sliceIncrement;
          console.log(timestampToPlay);
          video.playVideo();
          video.seekTo(timestampToPlay);
        });
      }
    });
  }

  render() {
    const opts = {
        height: '396',
        width: '704',
        playerVars: { 
            autoplay: 1
          }
    }

    if (this.props.provider === "yt") {
      const videoId = this.props.url.split('?v=')[1];
      return (
        <YouTube id="player"

          videoId={videoId}
          opts={opts}
          onReady={this._onReady}
        />
      );
    } /*else if (this.props.provider === "sc" ) {
      return (

      );
    }*/
  }
}

export default Embed;
