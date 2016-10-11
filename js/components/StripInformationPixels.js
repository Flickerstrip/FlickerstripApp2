import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
    AlertIOS,
} from "react-native";

var _ = require("lodash");

import layoutStyles from "~/styles/layoutStyles";
import LightworkRow from "~/components/LightworkRow";
import StripActions from "~/actions/StripActions";
import FlickerstripManager from "~/stores/FlickerstripManager";
import MenuButton from "~/components/MenuButton";
import SettingsActions from "~/actions/SettingsActions";
import SettingsList from "react-native-settings-list";

class StripInformationPixels extends React.Component {
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
        var memoryString = memory.used + " / " + memory.total + " blocks used (" + memory.free +" available)";
        return (
            <View style={layoutStyles.flexColumn}>
                <SettingsList key={this.state.key}>
                    <SettingsList.Item
                        title="Length"
                        titleInfo={""+this.props.strip.length}
                        hasNavArrow={false}
                        onPress={() => {
                            AlertIOS.prompt(
                                "Set length of strip",
                                null,
                                value => StripActions.configure(this.props.strip.id,{length:value}),
                                "plain-text",
                                ""+this.props.strip.length
                            );
                        }}
                    />
                    <SettingsList.Item
                        title="Start"
                        titleInfo={""+(this.props.strip.start == 0 ? "First" : this.props.strip.start)}
                        hasNavArrow={false}
                        onPress={() => {
                            AlertIOS.prompt(
                                "Set start pixel",
                                null,
                                value => StripActions.configure(this.props.strip.id,{start:value}),
                                "plain-text",
                                ""+this.props.strip.start
                            );
                        }}
                    />
                    <SettingsList.Item
                        title="End"
                        titleInfo={""+(this.props.strip.end == -1 ? "Last" : this.props.strip.end)}
                        hasNavArrow={false}
                        onPress={() => {
                            AlertIOS.prompt(
                                "Set end pixel",
                                null,
                                [
                                    {text: 'Clear', onPress: () => StripActions.configure(this.props.strip.id,{end:-1})},
                                    {text: 'Cancel'},
                                    {text: 'Save', onPress: (value) => StripActions.configure(this.props.strip.id,{end:value})},
                                ],
                                "plain-text",
                                ""+(this.props.strip.end == -1 ? "" : this.props.strip.end),
                            );
                        }}
                    />
                </SettingsList>
            </View>
        )
    }
}

export default StripInformationPixels;



