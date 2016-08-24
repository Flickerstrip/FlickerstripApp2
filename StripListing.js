import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ListView,
} from 'react-native';

var _ = require('lodash');

import StripCell from "./StripCell";

var StripManager = require("./StripManager").getInstance();

class This extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }).cloneWithRows(_.values(StripManager.strips)),
    };

    StripManager.on("StripAdded",this.updateDatasource.bind(this));
    StripManager.on("StripRemoved",this.updateDatasource.bind(this));
  }
  selectStrip(strip) {
    console.log("strip selected",strip.name);
  }
  stripToggle(strip) {
    strip.toggle(!strip.power);
    strip.power = !strip.power;
    console.log("finished toggling");
  }
  renderRow(strip: Object,sectionID: number | string,rowID: number | string, highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void) {
    return (
      <StripCell
        strip={strip}
        onSelect={() => this.selectStrip(strip)}
        onToggle={() => this.stripToggle(strip)}
      />
    );
  }
  updateDatasource() {
    console.log("updating datasource..",_.pluck(_.values(StripManager.strips).slice(0),"ip"));
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(_.values(StripManager.strips).slice(0))
    });
  }
  getDataSource(data: Array<any>): ListView.DataSource {
    return this.state.dataSource.cloneWithRows(data);
  }
  render() {
    return (
      <ListView
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

export default This;
