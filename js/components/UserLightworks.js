import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
    SegmentedControlIOS,
    AlertIOS
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
import MenuButton from "~/components/MenuButton";

class UserLightworks extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            key: null,
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }).cloneWithRows([]),
        };

        this.refreshUserLightworks = this.refreshUserLightworks.bind(this);
    }
    componentWillMount() {
        LightworkManager.on("UserLightworkListUpdated",this.refreshUserLightworks);
        this.refreshUserLightworks();
    }
    componentWillUnmount() {
        LightworkManager.removeListener("UserLightworkListUpdated",this.refreshUserLightworks);
    }
    rowDrilldownPressed(lw) {
        EditorActions.openLightwork(lw.id);
    }
    renderRow(lightwork: Object,sectionID: number | string,rowID: number | string, highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void) {
        return (
            <LightworkRow
                lightwork     = {lightwork}
                showPublished = {true}
                selected      = {() => lightwork.selected || false}
                onDrilldown   = {() => this.rowDrilldownPressed(lightwork)}
                onPress       = {() => lightwork.selected ? LightworkActions.deselectLightwork(lightwork.id) : LightworkActions.selectLightwork(lightwork.id)}
                onPressTmp    = {() => LightworkManager.getSelectedCount() == 0 ? BulkActions.previewLightworkOnSelectedStrips(lightwork.id) : lightwork.selected ? LightworkActions.deselectLightwork(lightwork.id) : LightworkActions.selectLightwork(lightwork.id)}
                onSelectToggle= {() => lightwork.selected ? LightworkActions.deselectLightwork(lightwork.id) : LightworkActions.selectLightwork(lightwork.id)}
                onLongPress   = {() => MenuButton.showMenu([
                    {"label":"Duplicate Lightwork", onPress:() => { 
                        AlertIOS.prompt(
                            "Duplicate Lightwork",
                            null,
                            value => LightworkActions.duplicateLightwork(lightwork.id,value),
                            "plain-text",
                            lightwork.name+" Copy"
                        );
                    }},
                    {"label":"Star Lightwork", onPress:() => { LightworkActions.starLightwork(lightwork.id,!lightwork.starred) }},
                    {"label":(lightwork.published ? "Unpublish" : "Publish") + " Lightwork", onPress:() => { LightworkActions.publishLightwork(lightwork.id,!lightwork.published) }},
                    {"label":"Rename Lightwork", onPress:() => { 
                        AlertIOS.prompt(
                            "Rename Lightwork",
                            null,
                            value => LightworkActions.editLightwork(lightwork.id,{name:value}),
                            "plain-text",
                            lightwork.name
                        );
                    }},
                    {"label":"Delete Lightwork", destructive:true, onPress:() => { LightworkActions.deleteLightwork(lightwork.id) }},
                    {"label":"Cancel", cancel:true},
                ]) }
            />
        );
    }
    refreshUserLightworks() {
        this.loading = true;
        LightworkManager.getUserLightworks(SettingsManager.getUserId(),function(result) {
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
                automaticallyAdjustContentInsets={false}
                //keyboardDismissMode="on-drag"
                //keyboardShouldPersistTaps={true}
                //showsVerticalScrollIndicator={false}
            />
        )
    }
}

export default UserLightworks;



