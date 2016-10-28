import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    WebView,
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

class LightworkEditor extends React.Component {
    constructor(props) {
        super(props);
    }
    componentWillReceiveProps(nextProps) {
        this.sendLightwork(nextProps.lightwork);
    }
    /*
    sendLightwork(lw) {
        var objectToSend = {
            command:"load",
            lightwork:lw
        }
        this.refs.webview.sendToBridge(JSON.stringify(objectToSend));
    }
    */
    onMessage(jsonString) {
        var json = JSON.parse(jsonString);
        if (json.command == "update") {
            console.log("update cmd");
            EditorManager.lightworkEdited(json.lightwork.id,{
                fps:json.lightwork.fps,
                frames:json.lightwork.frames,
                pixels:json.lightwork.pixels,
                pixelData:json.lightwork.pixelData
            });
        }
    }
    render() {
        var patternDefinition = "var injectedPattern="+JSON.stringify(this.props.lightwork)+";";
        return (
            <View style={layoutStyles.flexColumn}>
                {renderIf(this.props.lightwork)(
                    <WebViewBridge
                        scrollEnabled={false}
                        ref="webview"
                        injectedJavaScript={patternDefinition}
                        style={layoutStyles.flexColumn}
                        onBridgeMessage={this.onMessage.bind(this)}
                        source={require("../../editor/build/editor.html")}
                    />
                )}
                {renderIf(!this.props.lightwork)(
                    <View style={layoutStyles.centerChildren}>
                        <View style={skinStyles.notePanel}>
                            <Text style={[skinStyles.noteText, {marginBottom: 20}]}>
                                No open Lightworks, create a new Lightwork to get started.
                            </Text>
                            <Button
                                style={skinStyles.button}
                                onPress={() => {
                                    EditorActions.createLightwork();
                                }}
                            >
                            Create new Lightwork
                        </Button>
                        </View>
                    </View>
                )}
            </View>
        )
    }
}

export default LightworkEditor;

