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

class LightworkRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {key: null};
    }

    render() {
        var TouchableElement = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableHighlight;
        return (
            <View key={this.state.key}>
                <View style={[styles.row,styles.flexRow]}>
                    <TouchableElement
                        onPress={this.props.onSelect}
                        //onShowUnderlay={this.props.onHighlight}
                        //onHideUnderlay={this.props.onUnhighlight}
                        style={[styles.flex1,styles.flexRow]}
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
    row: {
        backgroundColor: 'white',
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

