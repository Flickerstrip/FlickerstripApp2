import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
    Platform,
    AlertIOS,
} from "react-native";

var _ = require("lodash");

import Prompt from 'react-native-prompt';
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

        this.state = {
            key: null,
            promptName:"",
            promptPlaceholder:"",
            promptValue:"",
            showPrompt:false,
            promptCallback:(value) => {},
        };
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
                            this.setState({
                                promptName:"Set length of strip",
                                promptPlaceholder:"pixels",
                                promptValue:""+this.props.strip.length,
                                showPrompt:true,
                                promptCallback:(value) => StripActions.configure(this.props.strip.id,{length:value}),
                            });
                        }}
                    />
                    <SettingsList.Item
                        title="Start"
                        titleInfo={""+(this.props.strip.start == 0 ? "First" : this.props.strip.start)}
                        hasNavArrow={false}
                        onPress={() => {
                            this.setState({
                                promptName:"Set start pixel",
                                promptPlaceholder:"start pixel index",
                                promptValue:""+this.props.strip.start,
                                showPrompt:true,
                                promptCallback:(value) => StripActions.configure(this.props.strip.id,{start:value}),
                            });
                        }}
                    />
                    <SettingsList.Item
                        title="End"
                        titleInfo={""+(this.props.strip.end == -1 ? "Last" : this.props.strip.end)}
                        hasNavArrow={false}
                        onPress={() => {
                            if (Platform.OS === 'ios') {
                                AlertIOS.prompt(
                                    "Set end pixel",
                                    null,
                                    [
                                        {text: "Clear", onPress: () => StripActions.configure(this.props.strip.id,{end:-1})},
                                        {text: "Cancel"},
                                        {text: "Save", onPress: (value) => StripActions.configure(this.props.strip.id,{end:value})},
                                    ],
                                    "plain-text",
                                    ""+(this.props.strip.end == -1 ? "" : this.props.strip.end),
                                );
                            } else {
                                this.setState({
                                    promptName:"Set end pixel",
                                    promptPlaceholder:"end pixel index",
                                    promptValue:(this.props.strip.end == -1 ? "" : this.props.strip.end),
                                    showPrompt:true,
                                    promptCallback:(value) => StripActions.configure(this.props.strip.id,{end:value}),
                                });
                            }
                        }}
                    />
                </SettingsList>
                <Prompt
                    title={this.state.promptName}
                    placeholder={this.state.promptPlaceholder}
                    defaultValue={this.state.promptValue}
                    visible={ this.state.showPrompt }
                    onCancel={ () => this.setState({showPrompt:false}) }
                    onSubmit={(value) => {
                        this.setState({showPrompt: false});
                        this.state.promptCallback(value);
                    }}
                />
            </View>
        )
    }
}

export default StripInformationPixels;



