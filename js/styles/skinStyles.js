import {
    StyleSheet,
} from "react-native";

//var primaryColor     = "#0096ff";
var primaryColor     = "#4974ff";
var backgroundPanel  = "#fefefe";
var panelBorderColor = "#e0e0e0";
var highlightColor   = "#c4daff";
var touchableUnderlayColor = highlightColor;

const skinStyles = StyleSheet.create({
    rowSelected: {
        paddingLeft: 10,
        paddingRight: 10,
        height: 50,
        backgroundColor: highlightColor,
        borderBottomWidth: 1,
        borderColor: panelBorderColor,
    },
    rowDeselected: {
        paddingLeft: 10,
        paddingRight: 10,
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
    sectionHeader:{
        backgroundColor: primaryColor,
        borderBottomWidth:2,
        borderColor: panelBorderColor,
        padding: 3,
        marginTop:10,
        marginBottom:3,

        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    sectionHeaderText: {
        color: "white",
    },
    noteText: {
        textAlign: "center",
        fontSize: 16,
    },
    button: {
        fontSize: 20,
        backgroundColor: primaryColor,
        color: "white",
        borderRadius: 10,
        padding: 5,
        borderWidth: 1,
        borderColor: primaryColor,
        overflow: "hidden",
        margin: 5,
    },
    navigationBar: {
        backgroundColor: backgroundPanel,
        borderBottomWidth: 1,
        borderColor: panelBorderColor,
    },
    navIcon: {
        color:primaryColor,
    },
    navigationTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "black",
    },
    navigationTextButton: {
        color: primaryColor,
        fontSize: 16,
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
    primaryIcon: {
        color:primaryColor,
    },
    successIcon: {
        color:"#5cb85c",
    },
    infoIcon: {
        color:"#5bc0de",
    },
    warningIcon: {
        color:"#f0ad4e",
    },
    dangerIcon: {
        color:"#d9534f",
    },
    passiveIcon: {
        color:"#999",
    },
});

skinStyles.tabBarIconSize=25;
skinStyles.touchableUnderlayColor = touchableUnderlayColor;

export default skinStyles;

