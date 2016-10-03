import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
} from 'react-native';

var _ = require("lodash");

import renderIf from "~/utils/renderIf"
import layoutStyles from "~/styles/layoutStyles";
import FlickerstripRow from "~/components/FlickerstripRow.js";
import StripActions from "~/actions/StripActions.js";
import FlickerstripManager from "~/stores/FlickerstripManager.js";
import MenuButton from "~/components/MenuButton.js";
import StripDetails from "~/components/StripDetails.js";
import Button from 'react-native-button'
import WiFiNetworkPrompt from "~/components/WiFiNetworkPrompt.js";

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

        FlickerstripManager.on("StripAdded",this.updateDatasource.bind(this));
        FlickerstripManager.on("StripRemoved",this.updateDatasource.bind(this));
    }
    rowPressed(strip) {
        if (FlickerstripManager.getSelectedCount() != 0) {
            return strip.selected ? StripActions.deselectStrip(strip.id) : StripActions.selectStrip(strip.id)
        }

        this.props.navigator.push({
            component: StripDetails,
            title:strip.name == '' ? 'Unknown Strip' : strip.name,
            wrapperStyle:layoutStyles.paddingTopForNavigation,
            passProps: { strip: strip },
            leftButtonTitle: "Back",
            onLeftButtonPress:() => {
                this.props.navigator.pop();
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
            title:"Configure Flickerstrip",
            wrapperStyle:layoutStyles.paddingTopForNavigation,
            leftButtonTitle: "Cancel",
            onLeftButtonPress:() => {
                this.props.navigator.pop();
            }
        });
    }
    render() {
        return (
            <View key={this.state.key} style={layoutStyles.flexColumn}>
                {renderIf(FlickerstripManager.getConfigurationMasterFlickerstrip() != null)(
                    <View>
                        <Text>Note: You are currently connected directly to Flickerstrip, for best performance configure your Flickerstrips with an existing WiFi network</Text>
                        <Button
                            style={{fontSize: 20}}
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
                    renderRow={this.renderRow.bind(this)}
                    //onEndReached={this.onEndReached}
                    //keyboardDismissMode="on-drag"
                    //keyboardShouldPersistTaps={true}
                    //showsVerticalScrollIndicator={false}
                />
            </View>
        )
    }
}

export default StripListing;
