import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
} from "react-native";

var _ = require("lodash");

import layoutStyles from "~/styles/layoutStyles";
import LightworkRow from "~/components/LightworkRow";
import StripActions from "~/actions/StripActions";
import FlickerstripManager from "~/stores/FlickerstripManager";
import MenuButton from "~/components/MenuButton";
import SettingsActions from "~/actions/SettingsActions";
import SettingsList from "react-native-settings-list";
import Button from "react-native-button"
import skinStyles from "~/styles/skinStyles";
import UpdateManager from "~/stores/UpdateManager.js";
import renderIf from "~/utils/renderIf"

class StripInformation extends React.Component {
    constructor(props) {
        super(props);

        this.state = { key: null };
    }
    componentWillMount() {
        this.listener = FlickerstripManager.addStripListener({
            id:this.props.strip.id,
            events: ["configuration","state"],
        },this.refresh.bind(this));
    }
    componentWillUnmount() {
        FlickerstripManager.removeStripListener(this.listener);
    }
    refresh() {
        this.setState({key:Math.random()});
    }
    render() {
        var memory = this.props.strip.memory;
        var memoryString = memory.used + " / " + memory.total + " (" + memory.free +" free)";
        return (
            <View style={layoutStyles.flexColumn}>
                <SettingsList key={this.state.key}>
                    <SettingsList.Item
                        title="Mac Address"
                        titleInfo={this.props.strip.id}
                        hasNavArrow={false}
                    />
                    <SettingsList.Item
                        title="IP Address"
                        titleInfo={this.props.strip.ip}
                        hasNavArrow={false}
                    />
                    <SettingsList.Item
                        title="Mac Address"
                        titleInfo={this.props.strip.id}
                        hasNavArrow={false}
                    />
                    <SettingsList.Item
                        title="Firmware Version"
                        titleInfo={this.props.strip.firmware}
                        hasNavArrow={false}
                    />
                    <SettingsList.Item
                        title="Memory"
                        titleInfo={memoryString}
                        hasNavArrow={false}
                    />
                </SettingsList>
                
                {renderIf(UpdateManager.compareLatestVersion(this.props.strip.firmware))(
                    <Button
                        style={skinStyles.button}
                        onPress={() => StripActions.updateFirmware(this.props.strip.id)}
                    >
                        Firmware update to {UpdateManager.getLatestVersion()}
                    </Button>
                )}
                <Button
                    style={skinStyles.button}
                    onPress={() => StripActions.forgetNetwork(this.props.strip.id)}
                >
                    Forget Network
                </Button>

            </View>
        )
    }
}

export default StripInformation;


