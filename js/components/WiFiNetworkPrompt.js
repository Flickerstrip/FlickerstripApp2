import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    TextInput,
} from 'react-native';

var _ = require("lodash");

import Button from 'react-native-button'
import renderIf from "~/utils/renderIf"
import layoutStyles from "~/styles/layoutStyles"
import FlickerstripManager from "~/stores/FlickerstripManager.js";

class WiFiNetworkPrompt extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.initialState();
    }
    initialState() {
        return {
            ssid: "SSID",
            password: "Password",
        }
    }
    configureButtonClicked() {
        FlickerstripManager.configureAll(this.state.ssid,this.state.password);
        this.props.navigator.pop();
    }
    render() {
        return (
            <View style={layoutStyles.flexColumn}>
                <Text>Network Name</Text>
                <TextInput
                    autoFocus={true}
                    style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                    onFocus={() => {if (this.state.ssid == this.initialState().ssid) this.setState({ssid:""}) }}
                    onBlur={() => {if (this.state.ssid == "") this.setState({ssid:this.initialState().ssid}) }}
                    clearButtonMode={"while-editing"}
                    returnKeyType={"next"}
                    onChangeText={(text) => this.setState({ssid:text})}
                    value={this.state.ssid}
                    onSubmitEditing={(event) => { 
                        this.refs.Password.focus(); 
                    }}
                />
                <Text>Password</Text>
                <TextInput
                    ref="Password"
                    style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                    onFocus={() => {if (this.state.password == this.initialState().password) this.setState({password:""}) }}
                    onBlur={() => {if (this.state.password == "") this.setState({password:this.initialState().password}) }}
                    clearButtonMode={"while-editing"}
                    returnKeyType={"go"}
                    onChangeText={(text) => this.setState({password:text})}
                    value={this.state.password}
                    onSubmitEditing={this.configureButtonClicked.bind(this)}
                />
                <Button
                    style={{fontSize: 20}}
                    onPress={this.configureButtonClicked.bind(this)}
                >
                    Configure Flickerstrips
                </Button>
            </View>
        )
    }
}

export default WiFiNetworkPrompt;
