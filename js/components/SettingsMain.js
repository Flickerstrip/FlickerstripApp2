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

class SettingsMain extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <View style={layoutStyles.flexColumn}>
                <Text>Settings</Text>
            </View>
        )
    }
}

export default SettingsMain;

