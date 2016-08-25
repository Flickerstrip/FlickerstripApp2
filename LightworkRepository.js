import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ListView,
  SegmentedControlIOS,
} from 'react-native';

var _ = require('lodash');

var LightworkService = require("./LightworkService");

class This extends React.Component {
  constructor(props) {
    super(props);

    var user = {
        id: 2,
        email: "julianh2o@gmail.com",
        password: "6ZUMm2TXrHmRuZd"
    };
    LightworkService.fetchUserLightworks(user,0,function(result) {
        this.updateDatasource(result);
    }.bind(this));

    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }).cloneWithRows([]),
    };
  }
  renderRow(lightwork: Object,sectionID: number | string,rowID: number | string, highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void) {
    return (
      <Text>{lightwork.name}</Text>
    );
  }
  updateDatasource(data) {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(data.slice(0))
    });
  }
  render() {
    return (
      <ListView
        ref="userLightworks"
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


