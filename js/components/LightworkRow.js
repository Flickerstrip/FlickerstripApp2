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

import renderIf from "~/utils/renderIf"
import LightworkManager from "~/stores/LightworkManager";
import skinStyles from "~/styles/skinStyles";
import CheckBox from 'react-native-checkbox';

class LightworkRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {key: null};

        this.lightworkUpdated = this.lightworkUpdated.bind(this); //hmmmmm.. is this the right way of doing this?
    }
    componentWillMount() {
        LightworkManager.on("LightworkUpdated",this.lightworkUpdated);
    }
    componentWillUnmount() {
        LightworkManager.removeListener("LightworkUpdated",this.lightworkUpdated);
    }
    lightworkUpdated(id) {
        if (id == this.props.lightwork.id) this.refresh();
    }
    refresh() {
        this.setState({key:Math.random()});
    }
    render() {
        var TouchableElement = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableHighlight;
        var selected = typeof this.props.selected == "function" ? this.props.selected() : this.props.selected;
        return (
            <View key = {this.state.key} style={[styles.row,styles.flexRow,selected ? skinStyles.rowSelected : skinStyles.rowDeselected] }>
                {/*TODO figure out why this generates an EXC_BAD_ACCESS ?? */}
                {renderIf(!this.props.strip)(
                    <CheckBox
                        label=''
                        checked={selected}
                        onChange={(checked) => this.props.onSelectToggle(this.props.lightwork)}
                    />
                )}
                <TouchableElement
                    onPress={this.props.onPress}
                    //onShowUnderlay={this.props.onHighlight}
                    //onHideUnderlay={this.props.onUnhighlight}
                    style={[styles.flex1,styles.flexRow]}
                >
                    <View style={[styles.flex1,styles.flexRow]}>
                        <View style={styles.flex1}>
                            <Text numberOfLines={2}>
                                {this.props.lightwork.name}
                            </Text>
                        </View>
                    </View>
                </TouchableElement>
                {renderIf(this.props.onDelete)(
                    <EIcon
                        name="close-o"
                        size={30}
                        color="rgba(255,0,0,1)"
                        onPress={this.props.onDelete}
                    />
                )}
                {renderIf(this.props.onDrilldown)(
                    <EIcon
                        name="chevron-right"
                        size={30}
                        color="rgba(55,150,255,1)"
                        onPress={this.props.onDrilldown}
                    />
                )}
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

export default LightworkRow;

