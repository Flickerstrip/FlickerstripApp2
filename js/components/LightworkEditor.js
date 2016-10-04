import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    WebView,
} from 'react-native';

import layoutStyles from "~/styles/layoutStyles";
import WebViewBridge from 'react-native-webview-bridge';
import LightworkManager from "~/stores/LightworkManager.js";

var _ = require("lodash");

class LightworkEditor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {lightwork:this.props.lightwork};
    }
    onReady() {
        if (this.state.lightwork) {
            var objectToSend = {
                command:"load",
                lightwork:this.state.lightwork
            }
            this.refs.webview.sendToBridge(JSON.stringify(objectToSend));
        }
    }
    onMessage(jsonString) {
        console.log("json",jsonString);
        var json = JSON.parse(jsonString);
        if (json.command == "ready") {
            this.onReady();
        }
    }
    render() {
        return (
            <WebViewBridge
                ref="webview"
                style={layoutStyles.flexColumn}
                onBridgeMessage={this.onMessage.bind(this)}
                source={require("../../editor/build/editor.html")}
            />
        )
    }
}

export default LightworkEditor;

