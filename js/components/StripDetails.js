import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
} from 'react-native';

var _ = require("lodash");

import layoutStyles from "~/styles/layoutStyles";
import LightworkRow from "~/components/LightworkRow";
import StripActions from "~/actions/StripActions";
import FlickerstripManager from "~/stores/FlickerstripManager";

class StripDetails extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            key: null,
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }).cloneWithRows(_.values(this.props.strip.patterns)),
        };
    }
    componentWillMount() {
        this.listener = FlickerstripManager.addListener({
            id:this.props.strip.id,
            events: ["patterns","state"],
        },this.refresh.bind(this));
    }
    refresh() {
        this.updateDatasource();
        this.setState({key:Math.random()});
    }
    renderRow(lightwork: Object,sectionID: number | string,rowID: number | string, highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void) {
        return (
            <LightworkRow
                lightwork={lightwork}
                strip={this.props.strip}
                selected={this.props.strip.selectedPattern == lightwork.id}
                onPress={() => { StripActions.selectPattern(this.props.strip.id, lightwork.id); }}
                onDelete={() => { StripActions.deletePattern(this.props.strip.id, lightwork.id); }}
            />
        );
    }
    updateDatasource() {
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.props.strip.patterns.slice(0))
        });
    }
    componentWillUnmount() {
        FlickerstripManager.removeListener(this.listener);
    }
    render() {
        return (
            <View style={layoutStyles.flexColumn}>
                <Text style={{flex: 0}}>Lightworks</Text>
                <ListView
                    style={{flex: 1}}
                    enableEmptySections={true}
                    renderRow={this.renderRow.bind(this)}
                    dataSource={this.state.dataSource}
                    automaticallyAdjustContentInsets={false}
                    //renderSeparator={this.renderSeparator}
                    //renderFooter={this.renderFooter}
                    //keyboardDismissMode="on-drag"
                    //keyboardShouldPersistTaps={true}
                    //showsVerticalScrollIndicator={false}
                />
            </View>
        )
    }
}

export default StripDetails;

