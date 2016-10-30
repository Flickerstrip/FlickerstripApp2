import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    TextInput,
    Platform,
    TouchableHighlight,
    Alert,
} from "react-native";

var _ = require("lodash");

import Button from "react-native-button"
import renderIf from "~/utils/renderIf"
import layoutStyles from "~/styles/layoutStyles"
import FlickerstripManager from "~/stores/FlickerstripManager.js";
import SettingsManager from "~/stores/SettingsManager.js";
import SettingsActions from "~/actions/SettingsActions.js";
import EIcon from "react-native-vector-icons/EvilIcons";
import NIcon from "react-native-vector-icons/Entypo";
import SettingsList from "react-native-settings-list";
import skinStyles from "~/styles/skinStyles";

class WiFiNetworkPrompt extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.initialState();
        this.state.showChoice = SettingsManager.isWiFiSet();
    }
    initialState() {
        return {
            ssid: "SSID",
            password: "",
        }
    }
    configureButtonClicked() {
        FlickerstripManager.configureAll(this.state.ssid,this.state.password);
        this.props.navigator.pop();

        Alert.alert(
            "Save WiFi credentials?",
            null,
            [
                {text: "Cancel", style: "cancel"},
                {text: "Save", onPress: () => SettingsActions.saveWifi(this.state.ssid,this.state.password) },
            ]
        );
        if (this.props.onDismiss) this.props.onDismiss();
    }
    configureWithSavedClicked() {
        FlickerstripManager.configureAll(SettingsManager.getWiFi().ssid,SettingsManager.getWiFi().password);
        this.props.navigator.pop();
        if (this.props.onDismiss) this.props.onDismiss();
    }
    render() {
        return (
            <View style={layoutStyles.flexColumn}>
                {this.state.showChoice ?
                    <View style={layoutStyles.flexColumn}>
                        <Text>You have a configured network:</Text>
                        <TouchableHighlight
                            onPress={this.configureWithSavedClicked.bind(this)}
                        >
                            <View style={[layoutStyles.flexRow, layoutStyles.flexCenter, {borderBottomWidth:1, borderColor: "black"}]}>
                                <NIcon name="signal" style={[layoutStyles.flex0, layoutStyles.imageIcon, skinStyles.primaryIcon]} size={40} />
                                <Text style={layoutStyles.flex1}>{"Use saved SSID: "+SettingsManager.getWiFi().ssid}</Text>
                            </View>
                        </TouchableHighlight>
                        <TouchableHighlight
                            onPress={() => { this.setState({showChoice:false}); setTimeout(function() {this._networkField.focus()}.bind(this),50) } }
                        >
                            <View style={[layoutStyles.flexRow, layoutStyles.flexCenter, {borderBottomWidth:1, borderColor: "black"}]}>
                                <NIcon name="signal" style={[layoutStyles.flex0, layoutStyles.imageIcon, skinStyles.primaryIcon]} size={40} />
                                <Text style={layoutStyles.flex1}>Enter Network SSID</Text>
                            </View>
                        </TouchableHighlight>
                    </View>
                :
                    <View style={layoutStyles.flexColumn}>
                        <Text>Network Name</Text>
                        <TextInput
                            autoFocus={true}
                            ref={(c) => this._networkField = c}
                            style={{height: 40, borderColor: "gray", borderWidth: 1}}
                            onFocus={() => {if (this.state.ssid == this.initialState().ssid) this.setState({ssid:""}) }}
                            onBlur={() => {if (this.state.ssid == "") this.setState({ssid:this.initialState().ssid}) }}
                            clearButtonMode={"while-editing"}
                            returnKeyType={"next"}
                            onChangeText={(text) => this.setState({ssid:text})}
                            value={this.state.ssid}
                            onSubmitEditing={(event) => { 
                                this._passwordField.focus(); 
                            }}
                        />
                        <Text>Password</Text>
                        <TextInput
                            ref={(c) => this._passwordField = c}
                            style={{height: 40, borderColor: "gray", borderWidth: 1}}
                            onFocus={() => {if (this.state.password == this.initialState().password) this.setState({password:""}) }}
                            onBlur={() => {if (this.state.password == "") this.setState({password:this.initialState().password}) }}
                            clearButtonMode={"while-editing"}
                            secureTextEntry={true}
                            returnKeyType={"go"}
                            onChangeText={(text) => this.setState({password:text})}
                            value={this.state.password}
                            onSubmitEditing={this.configureButtonClicked.bind(this)}
                        />
                        <Button
                            style={skinStyles.button}
                            onPress={this.configureButtonClicked.bind(this)}
                        >
                            Configure Flickerstrips
                        </Button>
                    </View>
                }
            </View>
        )
    }
}

export default WiFiNetworkPrompt;
