import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
    Alert,
} from "react-native";

var _ = require("lodash");

import renderIf from "~/utils/renderIf"
import layoutStyles from "~/styles/layoutStyles";
import FlickerstripRow from "~/components/FlickerstripRow.js";
import StripActions from "~/actions/StripActions.js";
import FlickerstripManager from "~/stores/FlickerstripManager.js";
import MenuButton from "~/components/MenuButton.js";
import StripDetails from "~/components/StripDetails.js";
import Button from "react-native-button"
import WiFiNetworkPrompt from "~/components/WiFiNetworkPrompt.js";
import ConfigureNewStrip from "~/components/ConfigureNewStrip.js";
import StatusBar from "~/components/StatusBar.js";
import skinStyles from "~/styles/skinStyles";
import UpdateManager from "~/stores/UpdateManager.js";

var NavigationBar = require("react-native-navbar");

class StripListing extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            key: null,
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }).cloneWithRows(_.values(FlickerstripManager.strips)),
        };

        this.updateDatasource = this.updateDatasource.bind(this);
    }
    componentWillMount() {
        FlickerstripManager.on("StripAdded",this.updateDatasource);
        FlickerstripManager.on("StripRemoved",this.updateDatasource);
    }
    componentWillUnmount() {
        FlickerstripManager.removeListener("StripAdded",this.updateDatasource);
        FlickerstripManager.removeListener("StripRemoved",this.updateDatasource);
    }
    rowPressed(strip) {
        this.props.navigator.push({
            component: StripDetails,
            center:{text:strip.name == "" ? "Unknown Strip" : strip.name},
            passProps: { strip: strip },
            left: {
                text: "Back",
                onPress:() => {
                    this.props.navigator.pop();
                }
            }
        });
    }
    renderRow(strip: Object,sectionID: number | string,rowID: number | string, highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void) {
        return (
            <FlickerstripRow
                strip={strip}
                onPress={() => this.rowPressed(strip)}
                onSelectToggle={() => { strip.selected ? StripActions.deselectStrip(strip.id) : StripActions.selectStrip(strip.id) }}
                onToggle={() => { StripActions.togglePower(strip.id,!strip.power) }}
            />
        );
    }
    updateDatasource() {
        this.setState({
            key: Math.random(),
            dataSource: this.state.dataSource.cloneWithRows(_.values(FlickerstripManager.strips).slice(0))
        });
    }
    getDataSource(data: Array<any>): ListView.DataSource {
        return this.state.dataSource.cloneWithRows(data);
    }
    configureButtonClicked() {
        this.props.navigator.push({
            component: WiFiNetworkPrompt,
            center: {text:"Configure Flickerstrip"},
            left:{
                text: "Cancel",
                onPress:() => {
                    this.props.navigator.pop();
                }
            }
        });
    }
    renderHeader() {
        return (<View>
            {renderIf(FlickerstripManager.firmwareUpdateRequired())(
                <Button
                    style={skinStyles.button}
                    onPress={() => Alert.alert(
                        'Update to '+UpdateManager.getLatestVersion(),
                        UpdateManager.getLatestVersionNote(),
                        [
                            {text:"Update",onPress:() => StripActions.updateAllFirmware()},
                            {text:"Cancel"},
                        ]
                    )}
                >
                    Firmware update available
                </Button>
            )}
        </View>)
    }
    render() {
        return FlickerstripManager.getCount() == 0 ? (
            <View style={[this.props.style,layoutStyles.flexColumn]}>
                <View key={this.state.key} style={layoutStyles.centerChildren}>
                    <View style={skinStyles.notePanel}>
                        <Text style={[skinStyles.noteText, {marginBottom: 20}]}>
                            There are no visible strips, check that all configured Flickerstrips are plugged in or configure new strips below.
                        </Text>
                        <Button
                            style={skinStyles.button}
                            onPress={() => {
                                this.props.navigator.push({
                                    component: ConfigureNewStrip,
                                    center:{text:"Add Flickerstrip"},
                                    left:{
                                        text: "Back",
                                        onPress:() => {
                                            this.props.navigator.pop();
                                        }
                                    }
                                });
                            }}
                        >
                        Configure new Flickerstrips
                    </Button>
                    </View>
                </View>
                <StatusBar />
            </View>
        ) : (
            <View key={this.state.key} style={[this.props.style,layoutStyles.flexColumn]}>
                {renderIf(FlickerstripManager.getConfigurationMasterFlickerstrip() != null)(
                    <View>
                        <Text>Note: You are currently connected directly to Flickerstrip, for best performance configure your Flickerstrips with an existing WiFi network</Text>
                        <Button
                            style={skinStyles.button}
                            onPress={this.configureButtonClicked.bind(this)}
                        >
                            Configure new Flickerstrips
                        </Button>
                    </View>
                )}
                <ListView
                    style={{flex: 1}}
                    ref="listview"
                    //renderSeparator={this.renderSeparator}
                    dataSource={this.state.dataSource}
                    enableEmptySections={true}
                    automaticallyAdjustContentInsets={false}
                    //renderFooter={this.renderFooter}
                    renderHeader={this.renderHeader}
                    renderRow={this.renderRow.bind(this)}
                    //onEndReached={this.onEndReached}
                    //keyboardDismissMode="on-drag"
                    //keyboardShouldPersistTaps={true}
                    //showsVerticalScrollIndicator={false}
                />
                <StatusBar />
            </View>
        )
    }
}

export default StripListing;
