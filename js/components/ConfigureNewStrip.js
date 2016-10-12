import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    TextInput,
    Platform,
    TouchableHighlight,
    TouchableNativeFeedback,
    Image,
    Dimensions,
} from "react-native";

var _ = require("lodash");

import Button from "react-native-button"
import renderIf from "~/utils/renderIf"
import layoutStyles from "~/styles/layoutStyles"
import FlickerstripManager from "~/stores/FlickerstripManager.js";
import SettingsManager from "~/stores/SettingsManager.js";
import EIcon from "react-native-vector-icons/EvilIcons";
import NIcon from "react-native-vector-icons/Entypo";
import SettingsList from "react-native-settings-list";
import WiFiNetworkPrompt from "~/components/WiFiNetworkPrompt";
import skinStyles from "~/styles/skinStyles";

class ConfigureNewStrip extends React.Component {
    constructor(props) {
        super(props);

        this.state = {key: null};

        this.refresh = this.refresh.bind(this);
    }
    componentWillMount() {
        FlickerstripManager.on("StripAdded",this.refresh);
        FlickerstripManager.on("StripRemoved",this.refresh);
    }
    componentWillUnmount() {
        FlickerstripManager.removeListener("StripAdded",this.refresh);
        FlickerstripManager.removeListener("StripRemoved",this.refresh);
    }
    refresh() {
        this.setState({key: Math.random()});
    }
    render() {
        var width = Dimensions.get('window').width;
        return FlickerstripManager.getConfigurationMasterFlickerstrip() ? (
            <View key={this.state.key} style={{flex:1, flexDirection:"column", alignItems:"center"}}>
                <Text style={{marginTop: 10, paddingLeft: 20, paddingRight: 20, fontWeight:"bold"}}>To configure a new Flickerstrip: </Text>
                <Text style={{padding: 20}}>
                    Found {FlickerstripManager.getCount()} strips ready to configure.
                </Text>
                <Button
                    style={skinStyles.button}
                    onPress={() => {
                        this.props.navigator.push({
                            component: WiFiNetworkPrompt,
                            title:"Configure Flickerstrip",
                            wrapperStyle:layoutStyles.paddingTopForNavigation,
                            passProps: { onDismiss: () => this.props.navigator.popToTop() },
                            leftButtonTitle: "Back",
                            onLeftButtonPress:() => {
                                this.props.navigator.pop();
                            }
                        });
                    }}
                >
                    Configure {FlickerstripManager.getCount()} Flickerstrips
                </Button>
            </View>
        ) : (
            <View key={this.state.key} style={{flex:1, flexDirection:"column", alignItems:"center"}}>
                <Text style={{marginTop: 10, paddingLeft: 20, paddingRight: 20, fontWeight:"bold"}}>To configure a new Flickerstrip: </Text>
                <Text style={{padding: 20}}>
                    Navigate to your WiFi settings and connect to the "Flickerstrip" network, then relaunch the Flickerstrip app
                </Text>
                <Image style={{flex: 1, width:width*.5, height:200}} resizeMode={"contain"} source={require("~/../resources/framed_wifi_screen.png")} />
            </View>
        )
    }
}

export default ConfigureNewStrip;

