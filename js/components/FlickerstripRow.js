"use strict";

var React = require("react");
var ReactNative = require("react-native");
var {
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableHighlight,
    Switch,
    View
} = ReactNative;

import EIcon from "react-native-vector-icons/EvilIcons";
import FlickerstripManager from "~/stores/FlickerstripManager.js";
import skinStyles from "~/styles/skinStyles";
import Checkbox from "~/components/Checkbox";
import UpdateManager from "~/stores/UpdateManager.js";
import FIcon from "react-native-vector-icons/FontAwesome";
import renderIf from "~/utils/renderIf"

class FlickerstripRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {key: null};

        this.handleFlickerstripUpdate = this.handleFlickerstripUpdate.bind(this);
        this.refresh = this.refresh.bind(this);
    }
    handleFlickerstripUpdate(id) {
        if (id == this.props.strip.id) this.refresh();
    }
    componentWillMount() {
        FlickerstripManager.on("StripUpdated",this.handleFlickerstripUpdate);
        UpdateManager.on("LatestReleaseUpdated",this.refresh);
    }
    componentWillUnmount() {
        FlickerstripManager.removeListener("StripUpdated",this.handleFlickerstripUpdate);
        UpdateManager.removeListener("LatestReleaseUpdated",this.refresh);
    }
    refresh() {
        this.setState({key:Math.random()});
    }
    render() {
        console.log("update manager",this.props.strip.firmware,UpdateManager.getLatestVersion(),UpdateManager.compareLatestVersion(this.props.strip.firmware));
        return (
            <View key={this.state.key}>
                <View style={[styles.row,styles.flexRow, this.props.strip.selected ? skinStyles.rowSelected : skinStyles.rowDeselected]}>
                    <Checkbox
                        onPress={() => this.props.onSelectToggle(this.props.strip)}
                        checked={this.props.strip.selected}
                    />
                    <TouchableHighlight
                        onPress={() => { this.props.onPress(this.props.strip) } }
                        style={[styles.flex1,styles.flexRow]}
                        >
                        <View style={[styles.flex1,styles.flexRow]}>
                            <View style={styles.flex1}>
                                <Text style={styles.movieTitle} numberOfLines={2}>
                                    {this.props.strip.name == "" ? "Unknown Strip" : this.props.strip.name}
                                </Text>
                            </View>
                            {renderIf(UpdateManager.compareLatestVersion(this.props.strip.firmware) == -1)(
                                <FIcon
                                    name="cloud-download"
                                    size={25}
                                    style={skinStyles.infoIconStyle}
                                />
                            )}
                        </View>
                    </TouchableHighlight>
                    <Switch
                        onValueChange={() => { this.props.onToggle(this.props.strip) }}
                        style={[styles.flex0]}
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
        alignItems: "center",
        flexDirection: "row",
    },
    flex0: {
        flex: 0,
    },
    flex1: {
        flex: 1,
    },
});

export default FlickerstripRow;
