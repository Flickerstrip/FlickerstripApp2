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
import FIcon from "react-native-vector-icons/FontAwesome";

import renderIf from "~/utils/renderIf"
import LightworkManager from "~/stores/LightworkManager";
import skinStyles from "~/styles/skinStyles";
import layoutStyles from "~/styles/layoutStyles";
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
            <View key = {this.state.key} style={[{padding: 5},layoutStyles.flexRow,selected ? skinStyles.rowSelected : skinStyles.rowDeselected] }>
                {/*TODO figure out why this generates an EXC_BAD_ACCESS ?? */}
                {/*
                {renderIf(!this.props.strip)(
                    <CheckBox
                        label=''
                        checked={selected}
                        onChange={(checked) => this.props.onSelectToggle(this.props.lightwork)}
                    />
                )}
                */}
                <TouchableElement
                    onPress={this.props.onPress}
                    onLongPress={this.props.onLongPress}
                    //onShowUnderlay={this.props.onHighlight}
                    //onHideUnderlay={this.props.onUnhighlight}
                    style={[layoutStyles.flex1,layoutStyles.flexRow]}
                >
                    <View style={[layoutStyles.flex1,layoutStyles.flexRow]}>
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

export default LightworkRow;

