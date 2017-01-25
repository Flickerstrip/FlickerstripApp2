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
} from "react-native";

var _ = require("lodash");
var EventEmitter = require("EventEmitter");

import Prompt from 'react-native-prompt';
import layoutStyles from "~/styles/layoutStyles";
import LightworkRow from "~/components/LightworkRow";
import StripActions from "~/actions/StripActions";
import FlickerstripManager from "~/stores/FlickerstripManager";
import MenuButton from "~/components/MenuButton";
import SettingsActions from "~/actions/SettingsActions";
import SettingsList from "react-native-settings-list";
import StripInformation from "~/components/StripInformation";
import StripInformationPixels from "~/components/StripInformationPixels";
import skinStyles from "~/styles/skinStyles";

class StripDetails extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            key: null,
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }).cloneWithRows(_.values(this.props.strip.patterns)),
            promptName:"",
            promptPlaceholder:"",
            promptValue:"",
            showPrompt:false,
            promptCallback:(value) => {},
        };

        this.stripRemovedHandler = this.stripRemovedHandler.bind(this);

        this.rowRefresher = new EventEmitter();
    }
    componentWillMount() {
        this.listener = FlickerstripManager.addStripListener({
            id:this.props.strip.id,
            events: ["patterns","state","configuration"],
        },this.refresh.bind(this));

        FlickerstripManager.on("StripRemoved",this.stripRemovedHandler);
    }
    componentWillUnmount() {
        FlickerstripManager.removeListener("StripRemoved",this.stripRemovedHandler);
        FlickerstripManager.removeStripListener(this.listener);
    }
    stripRemovedHandler(id) {
        if (this.props.strip.id != id) return;
        this.props.navigator.popToTop();
    }
    refresh() {
        this.updateDatasource();
        this.setState({key: Math.random()});
        this.rowRefresher.emit("Refresh");
    }
    renderRow(lightwork: Object,sectionID: number | string,rowID: number | string, highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void) {
        return (
            <LightworkRow
                lightwork={lightwork}
                strip={this.props.strip}
                rowRefresher={this.rowRefresher}
                selected={() => this.props.strip.selectedPattern == lightwork.id}
                onPress={() => { StripActions.selectPattern(this.props.strip.id, lightwork.id); }}
                onLongPress={() => MenuButton.showMenu([
                    {"label":"Download Lightwork", onPress:() => StripActions.downloadLightwork(this.props.strip.id, lightwork.id) },
                    {"label":"Delete Lightwork", destructive:true, onPress:() => { StripActions.deletePattern(this.props.strip.id, lightwork.id); }},
                    {"label":"Cancel", cancel:true},
                ]) }
                onDelete={() => { StripActions.deletePattern(this.props.strip.id, lightwork.id); }}
            />
        );
    }
    updateDatasource() {
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.props.strip.patterns.slice(0))
        });
    }
    renderHeader() {
        var stripLengthString = ""+this.props.strip.length;
        var start = this.props.strip.start == -1 ? 0 : this.props.strip.start;
        var end = this.props.strip.end == -1 ? this.props.strip.length : this.props.strip.end;
        if (start != 0 || end != this.props.strip.length) {
            stripLengthString += " [" + start + " - " + end + "]";
        }
        if (this.props.strip.reversed) stripLengthString += " (reversed)";
        var stripName = this.props.strip.name == "" ? "Unknown Strip" : this.props.strip.name;
        return (
            <View style={layoutStyles.flexColumn} key={this.state.key}>
                <View style={[layoutStyles.flexRow, layoutStyles.flexAlignCenter]}>
                    <Text style={{padding: 5}}>Brightness: </Text>
                    <Slider
                        style={{flex: 1}}
                        minimumValue={1}
                        maximumValue={100}
                        step={1}
                        value={this.props.strip.brightness}
                        onSlidingComplete={(value) => StripActions.configure(this.props.strip.id,{brightness:value})}
                    />
                </View>
                <SettingsList key={this.state.key} useScrollView={false}>
                    <SettingsList.Item
                        title="Info"
                        titleInfo={this.props.strip.ip}
                        hasNavArrow={true}
                        onPress={() => this.props.navigator.push({
                            component: StripInformation,
                            center:{text:stripName},
                            passProps: { strip: this.props.strip },
                            left:{
                                text: "Back",
                                onPress:() => {
                                    this.props.navigator.pop();
                                }
                            }
                        })}
                    />
                    <SettingsList.Item
                        title="Name"
                        titleInfo={stripName}
                        hasNavArrow={false}
                        onPress={() => {
                            this.setState({
                                promptName:"Rename strip",
                                promptPlaceholder:"Strip name",
                                promptValue:this.props.strip.name,
                                showPrompt:true,
                                promptCallback:(value) => StripActions.configure(this.props.strip.id,{name:value}),
                            });
                        }}
                    />
                    <SettingsList.Item
                        title="Group"
                        titleInfo={this.props.strip.group.length ? this.props.strip.group : "None"}
                        hasNavArrow={false}
                        onPress={() => {
                            this.setState({
                                promptName:"Set group",
                                promptPlaceholder:"Group name",
                                promptValue:this.props.strip.group,
                                showPrompt:true,
                                promptCallback:(value) => StripActions.configure(this.props.strip.id,{group:value}),
                            });
                        }}
                    />
                    <SettingsList.Item
                        title="Pixels"
                        titleInfo={stripLengthString}
                        hasNavArrow={true}
                        onPress={() => this.props.navigator.push({
                            component: StripInformationPixels,
                            center:{text:stripName},
                            passProps: { strip: this.props.strip },
                            left:{
                                text: "Back",
                                onPress:() => {
                                    this.props.navigator.pop();
                                }
                            }
                        })}
                    />
                    <SettingsList.Item
                        title="Lightwork Cycle Frequency"
                        titleInfo={""+(this.props.strip.cycle == 0 ? "Disabled" : this.props.strip.cycle)}
                        hasNavArrow={false}
                        onPress={() => {
                            if (Platform.OS === 'ios') {
                                AlertIOS.prompt(
                                    "Cycle Frequency",
                                    "Automatically cycles through patterns (seconds)",
                                    [
                                        {text: "Disable", onPress: () => StripActions.configure(this.props.strip.id,{cycle:0})},
                                        {text: "Cancel"},
                                        {text: "Save", onPress: (value) => StripActions.configure(this.props.strip.id,{cycle:value})},
                                    ],
                                    "plain-text",
                                    ""+(this.props.strip.cycle == 0 ? "" : this.props.strip.cycle)
                                );
                            } else {
                                this.setState({
                                    promptName:"Cycle Frequency (seconds)",
                                    promptPlaceholder:"seconds",
                                    promptValue:""+(this.props.strip.cycle == 0 ? "" : this.props.strip.cycle),
                                    showPrompt:true,
                                    promptCallback:(value) => StripActions.configure(this.props.strip.id,{cycle:parseInt(value)}),
                                });
                            }
                        }}
                    />
                    <SettingsList.Item
                        title="Transition Duration"
                        titleInfo={""+(this.props.strip.fade == 0 ? "Disabled" : this.props.strip.fade)}
                        hasNavArrow={false}
                        onPress={() => {
                            if (Platform.OS === 'ios') {
                                AlertIOS.prompt(
                                    "Transition duration",
                                    "Crossfades pattern transitions (milliseconds)",
                                    [
                                        {text: "Disable", onPress: () => StripActions.configure(this.props.strip.id,{fade:0})},
                                        {text: "Cancel"},
                                        {text: "Save", onPress: (value) => StripActions.configure(this.props.strip.id,{fade:value})},
                                    ],
                                    "plain-text",
                                    ""+(this.props.strip.fade == 0 ? "" : this.props.strip.fade)
                                );
                            } else {
                                this.setState({
                                    promptName:"Transition duration (millis)",
                                    promptPlaceholder:"millis",
                                    promptValue:""+(this.props.strip.fade == 0 ? "" : this.props.strip.fade),
                                    showPrompt:true,
                                    promptCallback:(value) => StripActions.configure(this.props.strip.id,{fade:parseInt(value)}),
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

                <View style={[layoutStyles.flex0,skinStyles.sectionHeader]}><Text style={skinStyles.sectionHeaderText}>Lightworks</Text></View>
            </View>
        )
    }
    render() {
        return (
            <ListView
                style={{flex: 1}}
                enableEmptySections={true}
                renderRow={this.renderRow.bind(this)}
                renderHeader={this.renderHeader.bind(this)}
                dataSource={this.state.dataSource}
                automaticallyAdjustContentInsets={false}
                //renderSeparator={this.renderSeparator}
                //renderFooter={this.renderFooter}
                //keyboardDismissMode="on-drag"
                //keyboardShouldPersistTaps={true}
                //showsVerticalScrollIndicator={false}
            />
        )
    }
}

export default StripDetails;

