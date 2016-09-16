'use strict';

var React = require("react");
var ReactNative = require("react-native");
var {
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableHighlight,
    Switch,
    TouchableNativeFeedback,
    View
} = ReactNative;

import EIcon from "react-native-vector-icons/EvilIcons";

import LightworkManager from "~/stores/LightworkManager.js";

class LightworkRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {key: null};

        setTimeout(function() {
            LightworkManager.on("LightworkUpdated",function(id) {
                if (id == this.props.lightwork.id) this.refresh();
            }.bind(this));
        }.bind(this),0);
    }

    refresh() {
        console.log("refresh"); //tODO figure out why this is generating a warning
        this.setState({key:Math.random()});
    }

    render() {
        var TouchableElement = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableHighlight;
        return (
            <View key={this.state.key}>
                <View style={[styles.row,styles.flexRow] }>
                    <TouchableElement
                        onPress={this.props.onSelect}
                        //onShowUnderlay={this.props.onHighlight}
                        //onHideUnderlay={this.props.onUnhighlight}
                        style={[styles.flex1,styles.flexRow,this.props.lightwork.selected ? styles.selected : styles.deselected]}
                        >
                        <View style={[styles.flex1,styles.flexRow]}>
                            <EIcon style={styles.flex0} name="navicon" size={30} color="rgba(0,136,204,1)" />
                            <View style={styles.flex1}>
                                <Text style={styles.movieTitle} numberOfLines={2}>
                                    {this.props.lightwork.name == '' ? 'Unknown Strip' : this.props.lightwork.name}
                                </Text>
                            </View>
                        </View>
                    </TouchableElement>
                </View>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    selected: {
        backgroundColor: 'red',
    },
    deselected: {
        backgroundColor: 'white',
    },
    row: {
        padding: 5,
    },
    flexRow: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    flex0: {
        flex: 0,
    },
    flex1: {
        flex: 1,
    },
});

export default LightworkRow;

