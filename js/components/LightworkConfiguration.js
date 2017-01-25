import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
    Slider,
    Platform,
    AlertIOS,
    TextInput,
} from "react-native";

var _ = require("lodash");
var EventEmitter = require("EventEmitter");

import Prompt from 'react-native-prompt';
import layoutStyles from "~/styles/layoutStyles";
import StripActions from "~/actions/StripActions";
import LightworkManager from "~/stores/LightworkManager";
import MenuButton from "~/components/MenuButton";
import SettingsActions from "~/actions/SettingsActions";
import SettingsList from "react-native-settings-list";
import skinStyles from "~/styles/skinStyles";
import LightworkActions from "~/actions/LightworkActions";

class LightworkConfiguration extends React.Component {
    constructor(props) {
        super(props);

        this.state = _.extend({key: null},LightworkManager.getConfiguration(this.props.lightwork.id) || {});
        if (this.state.brightness === undefined) this.state.brightness = 100;
        if (this.state.speed === undefined) this.state.speed = 1.0;
    }
    componentWillMount() {
    }
    componentWillUnmount() {
    }
    setBrightness(brightness) {
        brightness = Math.round(brightness);
        if (brightness < 1) brightness = 1;
        if (brightness > 100) brightness = 100;

        this.setState({"brightness":brightness});
        LightworkActions.configureLightwork(this.props.lightwork.id,{
            brightness: brightness,
        });
    }
    setSpeed(speed) {
        speed = Math.round(speed * 100) / 100;

        this.setState({"speed":speed});
        LightworkActions.configureLightwork(this.props.lightwork.id,{
            speed: speed,
        });
    }
    render() {
        return (
            <View style={layoutStyles.flexColumn}>
                <View style={[layoutStyles.flexRow, layoutStyles.flexAlignCenter]}>
                    <Text style={{padding: 5}}>Brightness: </Text>
                    <Slider
                        style={{flex: 1}}
                        minimumValue={1}
                        maximumValue={100}
                        step={1}
                        value={this.state.brightness}
                        onSlidingComplete={(value) => this.setBrightness(value)}
                        onValueChange={(value) => this._brightnessInput.setNativeProps({text: value+""})}
                    />
                    <TextInput
                        style={{flex: 0, width: 25, fontSize: 10}}
                        ref={(c) => this._brightnessInput = c}
                        keyboardType={"numeric"}
                        editable={true}
                        defaultValue={this.state.brightness+""}
                        onSubmitEditing={(event) => this.setBrightness(parseInt(event.nativeEvent.text))}
                        maxLength={4}
                    />
                    <Text style={{flex: 0}}>%</Text>
                </View>
                <View style={[layoutStyles.flexRow, layoutStyles.flexAlignCenter]}>
                    <Text style={{padding: 5}}>Speed: </Text>
                    <Slider
                        style={{flex: 1}}
                        minimumValue={-5}
                        maximumValue={5}
                        step={.01}
                        value={this.state.speed}
                        onSlidingComplete={(value) => this.setSpeed(value)}
                        onValueChange={(value) => this._speedInput.setNativeProps({text:value.toFixed(2)})}
                    />
                    <TextInput
                        style={{flex: 0, width: 35, fontSize: 10}}
                        ref={(c) => this._speedInput = c}
                        keyboardType={"numeric"}
                        editable={true}
                        defaultValue={this.state.speed+""}
                        onSubmitEditing={(event) => this.setSpeed(parseFloat(event.nativeEvent.text))}
                        maxLength={4}
                    />
                </View>
            </View>
        )
    }
}

export default LightworkConfiguration;


