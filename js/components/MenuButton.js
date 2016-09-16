import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    ActionSheetIOS,
    Text,
    View,
} from 'react-native';

import EIcon from "react-native-vector-icons/EvilIcons";
import NIcon from "react-native-vector-icons/Entypo";
import FIcon from "react-native-vector-icons/FontAwesome";
import menuCommonStyles from "~/styles/menuCommonStyles";

var _ = require("lodash");

class MenuButton extends React.Component {
    constructor(props) {
        super(props);
    }
    optionClicked(index) {
        var opt = this.props.options[index];
        if (opt.onPress) opt.onPress();
    }
    showMenu() {
        ActionSheetIOS.showActionSheetWithOptions({
            options: _.pluck(this.props.options,"label"),
            cancelButtonIndex: _.findIndex(this.props.options, {"cancel":true}),
            destructiveButtonIndex: _.findIndex(this.props.options, {"destructive":true}),
        },this.optionClicked.bind(this));
    }
    render() {
        return (
            <EIcon
                name={this.props.name}
                size={30}
                color="rgba(0,136,204,1)"
                style={menuCommonStyles.navigationBarIconPadding}
                onPress={() => this.showMenu(this)}
            />
        )
    }
}

export default MenuButton;

