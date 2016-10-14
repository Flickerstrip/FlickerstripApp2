import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
    SegmentedControlIOS,
} from "react-native";

import LightworkRow from "~/components/LightworkRow.js";
import PaginatedListView from "~/components/PaginatedListView.js";
import LightworkActions from "~/actions/LightworkActions.js";
import LightworkManager from "~/stores/LightworkManager.js";
import BulkActions from "~/actions/BulkActions.js";
import EditorActions from "~/actions/EditorActions.js";
import MenuButton from "~/components/MenuButton";

var _ = require("lodash");

class LightworkRepository extends React.Component {
    constructor(props) {
        super(props);

        this.state = {key: null};

        this.refresh = this.refresh.bind(this);
    }
    componentWillMount() {
        LightworkManager.on("PublicLightworkListUpdated",this.refresh);
    }
    componentWillUnmount() {
        LightworkManager.removeListener("PublicLightworkListUpdated",this.refresh);
    }
    refresh() {
        this.setState({key:Math.random()});
    }
    rowDrilldownPressed(lw) {
        EditorActions.openLightwork(lw.id);
    }
    renderRow(lightwork: Object,sectionID: number | string,rowID: number | string, highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void) {
        return (
            <LightworkRow
                lightwork      = {lightwork}
                selected       = {() => lightwork.selected}
                onDrilldown    = {() => this.rowDrilldownPressed(lightwork)}
                onPress        = {() => LightworkManager.getSelectedCount() == 0 ? BulkActions.previewLightworkOnSelectedStrips(lightwork.id) : lightwork.selected ? LightworkActions.deselectLightwork(lightwork.id) : LightworkActions.selectLightwork(lightwork.id)}
                onLongPress    = {() => MenuButton.showMenu([
                    {"label":"Clone to My Lightworks", onPress:() => LightworkActions.duplicateLightwork(lightwork.id,lightwork.name) },
                    {"label":"Star Lightwork", onPress:() => { LightworkActions.starLightwork(lightwork.id,!lightwork.starred) }},
                    {"label":"Cancel", cancel:true},
                ]) }
                onSelectToggle = {() => lightwork.selected ? LightworkActions.deselectLightwork(lightwork.id) : LightworkActions.selectLightwork(lightwork.id)}
            />
        );
    }
    loadLightworks(page,cb) {
        LightworkManager.getPublicLightworks(page,cb);
    }
    render() {
        return (
            <PaginatedListView
                key={this.state.key}
                loadFunction={this.loadLightworks.bind(this)}
                style={{flex: 1, flexDirection: "column"}}
                enableEmptySections={true}
                renderRow={this.renderRow.bind(this)}
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

export default LightworkRepository;


