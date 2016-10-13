import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
    AlertIOS,
    Slider,
} from "react-native";

var _ = require("lodash");

import layoutStyles from "~/styles/layoutStyles";
import LightworkRow from "~/components/LightworkRow";
import StripActions from "~/actions/StripActions";
import FlickerstripManager from "~/stores/FlickerstripManager";
import MenuButton from "~/components/MenuButton";
import SettingsActions from "~/actions/SettingsActions";
import SettingsList from "react-native-settings-list";
import StripInformation from "~/components/StripInformation";
import StripInformationPixels from "~/components/StripInformationPixels";

class StripDetails extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            key: null,
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }).cloneWithRows(_.values(this.props.strip.patterns)),
        };

        this.stripRemovedHandler = this.stripRemovedHandler.bind(this);
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
        this.setState({key:Math.random()});
    }
    renderRow(lightwork: Object,sectionID: number | string,rowID: number | string, highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void) {
        return (
            <LightworkRow
                lightwork={lightwork}
                strip={this.props.strip}
                selected={this.props.strip.selectedPattern == lightwork.id}
                onPress={() => { StripActions.selectPattern(this.props.strip.id, lightwork.id); }}
                onLongPress={() => MenuButton.showMenu([
                    {"label":"Download Lightwork", onPress:() => StripActions.downloadLightwork(this.props.strip.id, lightwork.id) },
                    {"label":"Delete Lightwork", destructive:true, onPress:() => { console.log("deleting lightwork.."); }},
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
            <View style={layoutStyles.flexColumn}>
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
                            title:stripName,
                            wrapperStyle:layoutStyles.paddingTopForNavigation,
                            passProps: { strip: this.props.strip },
                            leftButtonTitle: "Back",
                            onLeftButtonPress:() => {
                                this.props.navigator.pop();
                            }
                        })}
                    />
                    <SettingsList.Item
                        title="Name"
                        titleInfo={stripName}
                        hasNavArrow={false}
                        onPress={() => {
                            AlertIOS.prompt(
                                "Rename strip",
                                null,
                                value => StripActions.configure(this.props.strip.id,{name:value}),
                                "plain-text",
                                this.props.strip.name
                            );
                        }}
                    />
                    <SettingsList.Item
                        title="Group"
                        titleInfo={this.props.strip.group.length ? this.props.strip.group : "None"}
                        hasNavArrow={false}
                        onPress={() => {
                            AlertIOS.prompt(
                                "Set group",
                                null,
                                value => StripActions.configure(this.props.strip.id,{group:value}),
                                "plain-text",
                                this.props.strip.group
                            );
                        }}
                    />
                    <SettingsList.Item
                        title="Pixels"
                        titleInfo={stripLengthString}
                        hasNavArrow={true}
                        onPress={() => this.props.navigator.push({
                            component: StripInformationPixels,
                            title:stripName,
                            wrapperStyle:layoutStyles.paddingTopForNavigation,
                            passProps: { strip: this.props.strip },
                            leftButtonTitle: "Back",
                            onLeftButtonPress:() => {
                                this.props.navigator.pop();
                            }
                        })}
                    />
                    <SettingsList.Item
                        title="Lightwork Cycle Frequency"
                        titleInfo={""+(this.props.strip.cycle == 0 ? "Disabled" : this.props.strip.cycle)}
                        hasNavArrow={false}
                        onPress={() => {
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
                        }}
                    />
                    <SettingsList.Item
                        title="Transition Duration"
                        titleInfo={""+(this.props.strip.fade == 0 ? "Disabled" : this.props.strip.fade)}
                        hasNavArrow={false}
                        onPress={() => {
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
                        }}
                    />
                </SettingsList>
                <Text style={{flex: 0}}>Lightworks</Text>
            </View>
        )
    }
    render() {
        return (
            <ListView
                key={this.state.key}
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

