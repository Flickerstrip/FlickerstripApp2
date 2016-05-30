import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ListView,
} from 'react-native';

var StripManager = require("./StripManager").getInstance();

class This extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }).cloneWithRows(StripManager.strips),
    };

    StripManager.on("StripAdded",this.updateDatasource.bind(this));
  }
  renderRow(strip: Object,sectionID: number | string,rowID: number | string, highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void) {
    return (
      <Text key={strip.id}>{strip.id} - {strip.ip}</Text>
    );
  }
  renderSeparator(sectionID: number | string, rowID: number | string, adjacentRowHighlighted: boolean) {
    return (
      <Text key={'SEP_' + sectionID + '_' + rowID}>SEP</Text>
    );
  }
  updateDatasource() {
    console.log("updating datasource..");
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(StripManager.strips)
    });
  }
  getDataSource(data: Array<any>): ListView.DataSource {
    return this.state.dataSource.cloneWithRows(data);
  }
  render() {
    return (
      <ListView
        ref="listview"
        renderSeparator={this.renderSeparator}
        dataSource={this.state.dataSource}
        enableEmptySections={true}
        //renderFooter={this.renderFooter}
        renderRow={this.renderRow}
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
