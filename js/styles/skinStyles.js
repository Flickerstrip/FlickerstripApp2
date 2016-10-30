import {
    StyleSheet,
} from "react-native";

var primaryColor     = "#0096ff";
var backgroundPanel  = "#fefefe";
var panelBorderColor = "#e0e0e0";
var highlightColor   = "#c4daff";

const skinStyles = StyleSheet.create({
    rowSelected: {
        height: 50,
        backgroundColor: highlightColor,
        borderBottomWidth: 1,
        borderColor: panelBorderColor,
    },
    rowDeselected: {
        height: 50,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderColor: panelBorderColor,
    },
    notePanel: {
        margin: 10,
        borderWidth: 1,
        borderColor: panelBorderColor,
        padding: 20,
        borderRadius: 10,
    },
    noteText: {
        textAlign: "center",
        fontSize: 16,
    },
    button: {
        fontSize: 20,
    },
    navigationBar: {
        backgroundColor: backgroundPanel,
        borderBottomWidth: 1,
        borderColor: panelBorderColor,
    },
    navIcon: {
        color:primaryColor,
    },
    navigationTitleStyle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "black",
    },
    tabBar: {
        backgroundColor: backgroundPanel,
    },
    tabTitle: {
        color: "#666666",
    },
    tabTitleSelected: {
        color: primaryColor,
    },
    infoIconStyle: {
        color:primaryColor,
    }
});

skinStyles.tabBarIconSize=25;

export default skinStyles;

