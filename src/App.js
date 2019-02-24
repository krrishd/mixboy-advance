import React, { Component } from 'react';
import Embed from './Embed';
import './App.css';

const YOUTUBE_REGEX = RegExp(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/);

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            url: '',
            urlForEmbed: null,
            embedProvider: null,
        }

        this.parseURL = this.parseURL.bind(this);
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

            <div className="App">

                <div id="header">

                    サンプラー

                </div>

                <div id="track">
                    <input
                        id="url-input"
                        type="url"
                        placeholder="Enter YouTube link here..."
                        onChange={this.parseURL}
                    />
                    {
                        this.state.urlForEmbed
                            ? <Embed url={this.state.urlForEmbed} provider={this.state.embedProvider} />
                            : <div id="empty"> </div>
                    }
                </div>

                <button id="newTrackButton">

                </button>



            </div>
        );
    }//end Render
}

export default App;
