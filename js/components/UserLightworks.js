import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
    SegmentedControlIOS,
} from 'react-native';

import LightworkRow from "~/components/LightworkRow.js";
import LightworkEditor from "~/components/LightworkEditor.js";
import EditorActions from "~/actions/EditorActions.js";
import layoutStyles from "~/styles/layoutStyles";

var _ = require("lodash");

import LightworkManager from "~/stores/LightworkManager.js";
import LightworkActions from "~/actions/LightworkActions.js";
import BulkActions from "~/actions/BulkActions.js";
import SettingsManager from "~/stores/SettingsManager";

class UserLightworks extends React.Component {
    constructor(props) {
        super(props);

        this.page = 0;

        this.state = {
            key: null,
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }).cloneWithRows([]),
        };

        LightworkManager.on("UserLightworksUpdated",() => this.refreshUserLightworks());
        this.refreshUserLightworks();
    }
    rowDrilldownPressed(lw) {
        EditorActions.openLightwork(lw.id);
    }
    renderRow(lightwork: Object,sectionID: number | string,rowID: number | string, highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void) {
        return (
            <LightworkRow
                lightwork     = {lightwork}
                selected      = {() => lightwork.selected || false}
                onDrilldown   = {() => this.rowDrilldownPressed(lightwork)}
                onPressTmp       = {() => lightwork.selected ? LightworkActions.deselectLightwork(lightwork.id) : LightworkActions.selectLightwork(lightwork.id)}
                onPress    = {() => LightworkManager.getSelectedCount() == 0 ? BulkActions.previewLightworkOnSelectedStrips(lightwork.id) : lightwork.selected ? LightworkActions.deselectLightwork(lightwork.id) : LightworkActions.selectLightwork(lightwork.id)}
                onSelectToggle= {() => lightwork.selected ? LightworkActions.deselectLightwork(lightwork.id) : LightworkActions.selectLightwork(lightwork.id)}
            />
        );
    }
    refreshUserLightworks() {
        this.loading = true;
        LightworkManager.getUserLightworks(SettingsManager.getUserId(),this.page,function(result) {
            this.loading = false;
            this.updateDatasource(result);
        }.bind(this));
    }
    updateDatasource(data) {
        setTimeout(function() {
            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(data.slice(0))
            });
        }.bind(this),0)
    }
    onEndReached() {
        if (this.loading) return;
        
        this.page++;
    }
    render() {
        return (
            <ListView
                ref="userLightworks"
                style={{flex: 1}}
                //renderSeparator={this.renderSeparator}
                dataSource={this.state.dataSource}
                enableEmptySections={true}
                //renderFooter={this.renderFooter}
                renderRow={this.renderRow.bind(this)}
                onEndReached={this.onEndReached}
                automaticallyAdjustContentInsets={false}
                //keyboardDismissMode="on-drag"
                //keyboardShouldPersistTaps={true}
                //showsVerticalScrollIndicator={false}
            />
        )
    }
}

export default UserLightworks;



