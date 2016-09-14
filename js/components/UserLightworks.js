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

var _ = require("lodash");

import LightworkService from "~/services/LightworkService.js";

class UserLightworks extends React.Component {
    constructor(props) {
        super(props);

        this.page = 0;
        this.refreshUserLightworks();

        this.state = {
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }).cloneWithRows([]),
        };
    }
    renderRow(lightwork: Object,sectionID: number | string,rowID: number | string, highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void) {
        return (
            <LightworkRow
            lightwork={lightwork}
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
        LightworkService.fetchUserLightworks(user,this.page,function(result) {
            this.loading = false;
            this.updateDatasource(result);
        }.bind(this));
    }
    updateDatasource(data) {
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(data.slice(0))
        });
    }
    onEndReached() {
        if (this.loading) return;
        
        this.page++;
        console.log("reached end of user lightworks");
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



