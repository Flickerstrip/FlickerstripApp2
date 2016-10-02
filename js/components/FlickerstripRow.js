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
import FlickerstripManager from "~/stores/FlickerstripManager.js";
import CheckBox from 'react-native-checkbox';
import skinStyles from '~/styles/skinStyles';

class FlickerstripRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {key: null};

        FlickerstripManager.on("StripUpdated",function(id) {
            if (id == this.props.strip.id) this.refresh();
        }.bind(this));
    }

    refresh() {
        this.setState({key:Math.random()});
    }

    //<EIcon style={styles.flex0} name="navicon" size={30} color="rgba(0,136,204,1)" />
    render() {
        var TouchableElement = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableHighlight;
        return (
            <View key={this.state.key}>
                <View style={[styles.row,styles.flexRow, this.props.strip.selected ? skinStyles.rowSelected : skinStyles.rowDeselected]}>
                    <CheckBox
                        label=''
                        checked={this.props.strip.selected}
                        onChange={(checked) => this.props.onSelectToggle(this.props.strip)}
                    />
                    <TouchableElement
                        onPress={() => { this.props.onPress(this.props.strip) } }
                        //onShowUnderlay={this.props.onHighlight}
                        //onHideUnderlay={this.props.onUnhighlight}
                        style={[styles.flex1,styles.flexRow]}
                        >
                        <View style={[styles.flex1,styles.flexRow]}>
                            <View style={styles.flex1}>
                                <Text style={styles.movieTitle} numberOfLines={2}>
                                    {this.props.strip.name == '' ? 'Unknown Strip' : this.props.strip.name}
                                </Text>
                            </View>
                        </View>
                    </TouchableElement>
                    <Switch
                        onValueChange={() => { this.props.onToggle(this.props.strip) }}
                        style={styles.flex0}
                        value={this.props.strip.power == 1} />
                </View>
            </View>
        );
    }
}

var styles = StyleSheet.create({
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

export default FlickerstripRow;
