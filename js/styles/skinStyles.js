import {
    StyleSheet,
} from "react-native";

const skinStyles = StyleSheet.create({
    rowSelected: {
        height: 50,
        backgroundColor: "#c4daff",
        borderBottomWidth: 1,
        borderColor: "#e0e0e0",
    },
    rowDeselected: {
        height: 50,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderColor: "#e0e0e0",
    },
    notePanel: {
        margin: 10,
        borderWidth: 1,
        borderColor: "#ccc",
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
        backgroundColor: "#fefefe",
        borderBottomWidth: 1,
        borderColor: "#e0e0e0",
    },
    navIcon: {
        color: "red",
    },
    navigationTitleStyle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    tabBar: {
        backgroundColor:"#fefefe",
    },
    tabTitle: {
        color: "#666666",
    },
    tabTitleSelected: {
        color: "#00f",
    }
});

skinStyles.tabBarIconSize=25;

export default skinStyles;

