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
import FIcon from "react-native-vector-icons/FontAwesome";

import renderIf from "~/utils/renderIf"
import LightworkManager from "~/stores/LightworkManager";
import skinStyles from "~/styles/skinStyles";
import layoutStyles from "~/styles/layoutStyles";
import Checkbox from "~/components/Checkbox";

var renderId = false;

class LightworkRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {key: null};

        this.lightworkUpdated = this.lightworkUpdated.bind(this);
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
        var selected = typeof this.props.selected == "function" ? this.props.selected() : this.props.selected;
        return (
            <View key={this.state.key} style={[layoutStyles.flexAlignStretch, layoutStyles.flexRow,selected ? skinStyles.rowSelected : skinStyles.rowDeselected] }>
                {renderIf(!this.props.strip)(
                    <TouchableHighlight
                        underlayColor={skinStyles.touchableUnderlayColor}
                        style={[layoutStyles.flexAlignCenter, layoutStyles.flexRow]}
                        onPress={() => this.props.onSelectToggle(this.props.lightwork)}
                    >
                        <View>
                            <Checkbox
                                onPress={() => this.props.onSelectToggle(this.props.lightwork)}
                                checked={selected}
                            />
                        </View>
                    </TouchableHighlight>
                )}
                <TouchableHighlight
                    underlayColor={skinStyles.touchableUnderlayColor}
                    onPress={this.props.onPress}
                    onLongPress={this.props.onLongPress}
                    style={[layoutStyles.flex1,layoutStyles.flexRow]}
                >
                    <View style={[layoutStyles.flex1,layoutStyles.flexRow, layoutStyles.flexAlignCenter]}>
                        <View style={[layoutStyles.flex1]}>
                            <Text numberOfLines={2}>
                                {renderId ? "["+this.props.lightwork.id+"]" : ""}
                                {this.props.lightwork.name}
                            </Text>
                        </View>
                        {renderIf(this.props.lightwork.pending)(
                            <FIcon
                                name="exclamation-triangle"
                                size={15}
                                style={skinStyles.passiveIcon}
                            />
                        )}
                        {renderIf(this.props.showPublished && this.props.lightwork.published)(
                            <FIcon
                                name="globe"
                                size={25}
                                style={skinStyles.infoIcon}
                            />
                        )}
                    </View>
                </TouchableHighlight>
                {renderIf(this.props.onDelete)(
                    <TouchableHighlight
                        underlayColor={skinStyles.touchableUnderlayColor}
                        onPress={this.props.onDelete}
                        style={[layoutStyles.flex0,layoutStyles.flexRow, layoutStyles.flexAlignCenter]}
                    >
                        <EIcon
                            name="trash"
                            size={30}
                            style={skinStyles.dangerIcon}
                        />
                    </TouchableHighlight>
                )}
                {renderIf(this.props.onDrilldown)(
                    <TouchableHighlight
                        underlayColor={skinStyles.touchableUnderlayColor}
                        onPress={this.props.onDrilldown}
                        style={[layoutStyles.flex0,layoutStyles.flexRow, layoutStyles.flexAlignCenter]}
                    >
                        <EIcon
                            name="chevron-right"
                            size={30}
                            style={skinStyles.passiveIcon}
                        />
                    </TouchableHighlight>
                )}
            </View>
        );
    }
}

export default LightworkRow;

