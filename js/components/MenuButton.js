import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
} from "react-native";

import EIcon from "react-native-vector-icons/EvilIcons";
import NIcon from "react-native-vector-icons/Entypo";
import FIcon from "react-native-vector-icons/FontAwesome";
import menuCommonStyles from "~/styles/menuCommonStyles";
import ComponentManager from "~/stores/ComponentManager";

var _ = require("lodash");

class MenuButton extends React.Component {
    constructor(props) {
        super(props);
    }
    static showMenu(opt) {
        ComponentManager.actionSheet.showActionSheetWithOptions({
            options: _.map(opt,"label"),
            cancelButtonIndex: _.findIndex(opt, {"cancel":true}),
            destructiveButtonIndex: _.findIndex(opt, {"destructive":true}),
        },function(index) {
            var item = opt[index];
            if (item.onPress) item.onPress();
        });
    }
    buttonClicked() {
        MenuButton.showMenu(this.props.options);
    }
    render() {
        return (
            <EIcon
                name={this.props.name}
                size={30}
                style={skinStyles.infoButton}
                style={menuCommonStyles.navigationBarIconPadding}
                onPress={() => this.showMenu(this)}
            />
        )
    }
}

export default MenuButton;

