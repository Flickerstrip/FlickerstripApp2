import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
    SegmentedControlIOS,
} from 'react-native';

import LightworkRow from "./js/components/LightworkRow";
import PaginatedListView from "./js/components/PaginatedListView";

var _ = require("lodash");

import LightworkService from "./js/services/LightworkService";

class LightworkRepository extends React.Component {
    constructor(props) {
        super(props);
    }
    renderRow(lightwork: Object,sectionID: number | string,rowID: number | string, highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void) {
        return (
            <LightworkRow
                lightwork={lightwork}
            />
        );
    }
    loadLightworks(page,cb) {
        var user = {
            id: 2,
            email: "julianh2o@gmail.com",
            password: "6ZUMm2TXrHmRuZd"
        };
        console.log("load lightworks called",page);
        LightworkService.fetchPublicLightworks(user,page,function(result) {
            cb(result.totalPages,result.results);
        });
    }
    render() {
        return (
            <PaginatedListView
                loadFunction={this.loadLightworks.bind(this)}
                style={{flex: 1, flexDirection: "column"}}
                ref="lightworkRepository"
                //renderSeparator={this.renderSeparator}
                enableEmptySections={true}
                //renderFooter={this.renderFooter}
                renderRow={this.renderRow.bind(this)}
                //automaticallyAdjustContentInsets={false}
                //keyboardDismissMode="on-drag"
                //keyboardShouldPersistTaps={true}
                //showsVerticalScrollIndicator={false}
            />
        )
    }
}

export default LightworkRepository;


