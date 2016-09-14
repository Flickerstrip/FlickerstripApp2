import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
} from 'react-native';

var _ = require("lodash");

import FlickerstripRow from "~/components/FlickerstripRow.js";
import StripActions from "~/actions/StripActions.js";
import FlickerstripManager from "~/stores/FlickerstripManager.js";

class StripListing extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }).cloneWithRows(_.values(FlickerstripManager.strips)),
        };

        FlickerstripManager.on("StripAdded",this.updateDatasource.bind(this));
        FlickerstripManager.on("StripRemoved",this.updateDatasource.bind(this));
    }
    selectStrip(strip) {
        if (strip.selected) {
            StripActions.deselectStrip(strip.id);
        } else {
            StripActions.selectStrip(strip.id);
        }
    }
    stripToggle(strip) {
        console.log("toggling strip: ",!strip.power);
        StripActions.togglePower(strip.id,!strip.power);
    }
    renderRow(strip: Object,sectionID: number | string,rowID: number | string, highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void) {
        return (
            <FlickerstripRow
                strip={strip}
                onSelect={() => this.selectStrip(strip)}
                onToggle={() => this.stripToggle(strip)}
            />
        );
    }
    updateDatasource() {
        console.log("updating datasource..",_.pluck(_.values(FlickerstripManager.strips).slice(0),"ip"));
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(_.values(FlickerstripManager.strips).slice(0))
        });
    }
    getDataSource(data: Array<any>): ListView.DataSource {
        return this.state.dataSource.cloneWithRows(data);
    }
    render() {
        return (
            <ListView
                style={{flex: 1}}
                ref="listview"
                //renderSeparator={this.renderSeparator}
                dataSource={this.state.dataSource}
                enableEmptySections={true}
                //renderFooter={this.renderFooter}
                renderRow={this.renderRow.bind(this)}
                //onEndReached={this.onEndReached}
                //automaticallyAdjustContentInsets={false}
                //keyboardDismissMode="on-drag"
                //keyboardShouldPersistTaps={true}
                //showsVerticalScrollIndicator={false}
            />
        )
    }
}

export default StripListing;
