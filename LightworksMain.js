import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ListView,
  SegmentedControlIOS,
} from 'react-native';

import renderIf from './renderIf'
import UserLightworks from "./UserLightworks";
import LightworkRepository from "./LightworkRepository";

var _ = require('lodash');

class This extends React.Component {
  constructor(props) {
    super(props);
    this.state = {activeTab: 0 };
  }
  render() {
    return (
      <View>
        <SegmentedControlIOS
          values={['My Lightworks','Lightwork Repository']}
          selectedIndex={this.state.activeTab}
          onChange={(event) => this.setState({activeTab:event.nativeEvent.selectedSegmentIndex})}
        />
        {renderIf(this.state.activeTab == 0)(
          <View>
            <UserLightworks />
          </View>
        )}
        {renderIf(this.state.activeTab == 1)(
          <View>
            <LightworkRepository />
          </View>
        )}
      </View>
    )
  }
}

export default This;
