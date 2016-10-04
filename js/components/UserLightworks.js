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
import layoutStyles from "~/styles/layoutStyles";

var _ = require("lodash");

import LightworkManager from "~/stores/LightworkManager.js";
import LightworkActions from "~/actions/LightworkActions.js";
import BulkActions from "~/actions/BulkActions.js";

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

        this.refreshUserLightworks();
    }
    rowDrilldownPressed(lw) {
        LightworkManager.getLightworkData(lw.id,function(lw) {
            this.props.navigator.push({
                component: LightworkEditor,
                title:lw.name,
                wrapperStyle:layoutStyles.paddingTopForNavigation,
                passProps: { lightwork: lw },
                leftButtonTitle: "Back",
                onLeftButtonPress:() => {
                    this.props.navigator.pop();
                }
            });
        }.bind(this));
    }
    renderRow(lightwork: Object,sectionID: number | string,rowID: number | string, highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void) {
        return (
            <LightworkRow
                lightwork     = {lightwork}
                selected      = {() => lightwork.selected}
                onDrilldown   = {() => this.rowDrilldownPressed(lightwork)}
                onPress       = {() => lightwork.selected ? LightworkActions.deselectLightwork(lightwork.id) : LightworkActions.selectLightwork(lightwork.id)}
                onPressTmp    = {() => LightworkManager.getSelectedCount() == 0 ? BulkActions.previewLightworkOnSelectedStrips(lightwork.id) : lightwork.selected ? LightworkActions.deselectLightwork(lightwork.id) : LightworkActions.selectLightwork(lightwork.id)}
                onSelectToggle= {() => lightwork.selected ? LightworkActions.deselectLightwork(lightwork.id) : LightworkActions.selectLightwork(lightwork.id)}
            />
        );
    }
    refreshUserLightworks() {
        this.loading = true;
        var user = {
            id: 2,
            email: "julianh2o@gmail.com",
            password: "6ZUMm2TXrHmRuZd"
        };
        LightworkManager.getUserLightworks(user,this.page,function(result) {
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



