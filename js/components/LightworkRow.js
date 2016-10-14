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
    TouchableNativeFeedback,
    View
} = ReactNative;

import EIcon from "react-native-vector-icons/EvilIcons";
import FIcon from "react-native-vector-icons/FontAwesome";

import renderIf from "~/utils/renderIf"
import LightworkManager from "~/stores/LightworkManager";
import skinStyles from "~/styles/skinStyles";
import layoutStyles from "~/styles/layoutStyles";
import Checkbox from "~/components/Checkbox";

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
        var TouchableElement = Platform.OS === "android" ? TouchableNativeFeedback : TouchableHighlight;
        var selected = typeof this.props.selected == "function" ? this.props.selected() : this.props.selected;
        return (
            <View key = {this.state.key} style={[layoutStyles.flexAlignStretch, layoutStyles.flexRow,selected ? skinStyles.rowSelected : skinStyles.rowDeselected] }>
                {renderIf(!this.props.strip)(
                    <TouchableElement
                        style={[layoutStyles.flexAlignCenter, layoutStyles.flexRow,{paddingLeft: 10, paddingRight: 0}]}
                        onPress={() => this.props.onSelectToggle(this.props.lightwork)}
                    >
                        <View>
                            <Checkbox
                                onPress={() => this.props.onSelectToggle(this.props.lightwork)}
                                checked={selected}
                            />
                        </View>
                    </TouchableElement>
                )}
                <TouchableElement
                    onPress={this.props.onPress}
                    onLongPress={this.props.onLongPress}
                    //onShowUnderlay={this.props.onHighlight}
                    //onHideUnderlay={this.props.onUnhighlight}
                    style={[layoutStyles.flex1,layoutStyles.flexRow]}
                >
                    <View style={[layoutStyles.flex1,layoutStyles.flexRow, layoutStyles.flexAlignCenter]}>
                        <View style={layoutStyles.flex1}>
                            <Text numberOfLines={2}>
                                {this.props.lightwork.name}
                            </Text>
                        </View>
                        {renderIf(this.props.showPublished && this.props.lightwork.published)(
                            <FIcon
                                name="globe"
                                size={25}
                                color="rgba(0,150,255,1)"
                            />
                        )}
                    </View>
                </TouchableElement>
                {renderIf(this.props.onDelete)(
                    <TouchableElement
                        onPress={this.props.onDelete}
                        style={[layoutStyles.flex0,layoutStyles.flexRow, layoutStyles.flexAlignCenter]}
                    >
                        <EIcon
                            name="close-o"
                            size={30}
                            color="rgba(255,0,0,1)"
                        />
                    </TouchableElement>
                )}
                {renderIf(this.props.onDrilldown)(
                    <TouchableElement
                        onPress={this.props.onDrilldown}
                        style={[layoutStyles.flex0,layoutStyles.flexRow, layoutStyles.flexAlignCenter]}
                    >
                        <EIcon
                            name="chevron-right"
                            size={30}
                            color="rgba(55,150,255,1)"
                        />
                    </TouchableElement>
                )}
            </View>
        );
    }
}

export default LightworkRow;

