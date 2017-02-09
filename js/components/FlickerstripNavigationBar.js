import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    WebView,
    Navigator,
    Platform,
    TouchableHighlight,
} from "react-native";

import layoutStyles from "~/styles/layoutStyles";
import WebViewBridge from "react-native-webview-bridge";
import LightworkManager from "~/stores/LightworkManager.js";
import EditorManager from "~/stores/EditorManager.js";
import renderIf from "~/utils/renderIf";
import skinStyles from "~/styles/skinStyles";
import Button from "react-native-button";
import EditorActions from "~/actions/EditorActions";

var _ = require("lodash");

class FlickerstripNavigationBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = { key: null };
        this.refresh = this.refresh.bind(this);
    }
    componentWillMount() {
        if (this.props.refresher) this.props.refresher.addListener("Refresh",this.refresh);
    }
    componentWillUnmount() {
        if (this.props.refresher) this.props.refresher.removeListener("Refresh",this.refresh);
    }
    refresh() {
        this.setState({key: Math.random()});
    }
    generateTitleButton(info,isTitle) {
        if (!info) return null;
        if (typeof info == "function") info = info();

        var content = null;
        if (info.text) content = (<Text style={isTitle?skinStyles.navigationTitle:skinStyles.navigationTextButton}>{info.text}</Text>);
        if (info.render) content = info.render();

        var containerStyles = [{padding:10,justifyContent:"center",flex:1}];

        if (info.onPress) {
            return (<TouchableHighlight underlayColor={skinStyles.touchableUnderlayColor} style={containerStyles} onPress={info.onPress}>{content}</TouchableHighlight>);
        } else {
            return (<View style={containerStyles}>{content}</View>);
        }
    }
    render() {
        return (
            <Navigator.NavigationBar
                key={this.state.key}
                routeMapper={{
                    LeftButton: (route, navigator, index, navState) => this.generateTitleButton(route.left),
                    RightButton: (route, navigator, index, navState) => this.generateTitleButton(route.right),
                    Title: (route, navigator, index, navState) => this.generateTitleButton(route.center,true),
                }}
                style={skinStyles.navigationBar}
                {...this.props}
            />
        );
    }
}

export default FlickerstripNavigationBar;
