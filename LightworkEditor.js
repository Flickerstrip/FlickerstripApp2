import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  WebView,
} from 'react-native';

var _ = require('lodash');

class LightworkEditor extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <WebView
        source={require('./editor-built.html')}
      />
    )
  }
}

export default LightworkEditor;

