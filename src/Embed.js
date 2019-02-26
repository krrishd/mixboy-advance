import React, { Component } from 'react';
import YouTube from 'react-youtube';
import { Timer } from 'easytimer.js';
import WebMidi from 'webmidi';

class Embed extends Component {
  constructor(props) {
    super(props);
    
    this.EmbedRef = React.createRef();
    this._onReady = this._onReady.bind(this);
    this.isCurrentlyPlaying = this.isCurrentlyPlaying.bind(this);
    this.unfocus = this.unfocus.bind(this);

    this.state = {
      video: null,
      sliceIncrement: 1,
      play: false,
      playerInterval: null,
      width: 640,
      height: 390,
      embedIsFocused: false,
      playTimer: null,
    }
  }

  requestInterval = function(fn, delay) {
    if( !window.requestAnimationFrame       && 
      !window.webkitRequestAnimationFrame && 
      !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
      !window.oRequestAnimationFrame      && 
      !window.msRequestAnimationFrame)
        return window.setInterval(fn, delay);
        
    var start = new Date().getTime(),
      handle = {};
      
    function loop() {
      var current = new Date().getTime(),
        delta = current - start;
        
      if(delta >= delay) {
        fn.call();
        start = new Date().getTime();
      }
  
      handle.value = requestAnimationFrame(loop);
    };
    
    handle.value = requestAnimationFrame(loop);

    return handle;
  }

  clearRequestInterval(handle) {
    window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value) :
    window.webkitCancelAnimationFrame ? window.webkitCancelAnimationFrame(handle.value) :
    window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value) : /* Support for legacy API */
    window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value) :
    window.oCancelRequestAnimationFrame ? window.oCancelRequestAnimationFrame(handle.value) :
    window.msCancelRequestAnimationFrame ? window.msCancelRequestAnimationFrame(handle.value) :
    clearInterval(handle);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.play) {
      let i = 0;
      this.state.video.playVideo();

      this.setState({
        playerInterval: this.requestInterval(() => {
          if (this.props.sequence && this.props.sequence[i] !== null) {
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
      if (this.state.playerInterval) {
        this.clearRequestInterval(this.state.playerInterval);
      }
    }
  }

  isCurrentlyPlaying() {
    return this.state.play;
  }

  _onReady(event) {
    const playerInterval = this.state.playerInterval;
    const isCurrentlyPlaying = this.isCurrentlyPlaying;
    const updateBackground = this.props.updateBackground;

    this.props.sequencerRef.current.focus();

    this.setState({
      video: event.target,
      sequencerIsFocused: true,
    }, () => {
      const durationInSeconds = this.state.video.getDuration();
      const video = this.state.video;
      const sliceIncrement = durationInSeconds / 24;

      if (!this.state.play) {
        const recordNote = this.props.recordNote;
    
        document.addEventListener('keydown', (e) => {
          const qwertyOrderedKeycodes = [
            81, 87, 69, 82, 84, 89,
            85, 73, 79, 80, 65, 83,
            68, 70, 71, 72, 74, 75,
            76, 90, 88, 67, 86, 66, 78, 77
          ];

          const keyCode = e.keyCode;

          if (keyCode >= 65 && keyCode <= 90 && this.state.sequencerIsFocused) { /* a -> z keys range from 65 -> 90 */
            e.preventDefault();

            const sliceIncrementForQwerty = durationInSeconds / (90 - 65);
            const secondsIntoVideo = qwertyOrderedKeycodes.indexOf(keyCode) * sliceIncrementForQwerty;

            video.playVideo();
            video.seekTo(secondsIntoVideo);

            recordNote({
              secondsIntoVideo,
              timePlayed: new Date(),
            });
          }
        });

        WebMidi.enable((err) => {
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

  unfocus(e) {
    console.log('yuh');
    this.setState({
      sequencerIsFocused: false,
    });
  }

  render() {
    if (this.props.provider === "yt") {
      const videoId = this.props.url.split('?v=')[1];

      return (
        <div
          className="Embed"
          ref={this.EmbedRef}
          onBlur={this.unfocus}
          tabIndex={1}
        >
          <YouTube
            videoId={videoId}
            opts={{
              width: window.screen.width * 0.6,
              height: (270/480) * (window.screen.width * 0.6),
              playerVars: {
                disablekb: 1,
              },
            }}
            onReady={this._onReady}
          />
        </div>
      )
    }
  }
}

export default Embed;
