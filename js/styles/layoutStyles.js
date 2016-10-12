import {
    StyleSheet,
} from "react-native";

var _ = require("lodash");

const layoutStyles = StyleSheet.create({
    flexColumn: {
        flex: 1,
        flexDirection: "column"
    },
    flexCenter: {
        justifyContent: "center",
    },
    flexAlignCenter: {
        alignItems: "center",
    },
    flexRow: {
        alignItems: "center",
        flexDirection: "row",
    },
    centerChildren:{
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    flex0: {
        flex: 0,
    },
    flex1: {
        flex: 1,
    },
    marginBottomForTab:{
        marginBottom: 50
    },
    paddingTopForNavigation:{
        paddingTop: 64
    },
    imageIcon:{
        marginTop: 10,
        marginLeft:15,
        alignSelf:"center",
        height:50,
        width:50
    },
});

layoutStyles.margin = function(top,right,bottom,left) {
    var map = {};
    if (top) map["marginTop"] = top;
    if (right) map["marginRight"] = right;
    if (bottom) map["marginBottom"] = bottom;
    if (left) map["marginLeft"] = left;
    return map;
}

export default layoutStyles;
