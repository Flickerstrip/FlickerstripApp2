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
import PaginatedListView from "~/components/PaginatedListView.js";
import LightworkActions from "~/actions/LightworkActions.js";
import LightworkManager from "~/stores/LightworkManager.js";

var _ = require("lodash");

class LightworkRepository extends React.Component {
    constructor(props) {
        super(props);
    }
    renderRow(lightwork: Object,sectionID: number | string,rowID: number | string, highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void) {
        return (
            <LightworkRow
                selected={() => lightwork.selected}
                onPress={() => lightwork.selected ? LightworkActions.deselectLightwork(lightwork.id) : LightworkActions.selectLightwork(lightwork.id)}
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
        LightworkManager.getPublicLightworks(user,page,cb);
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


