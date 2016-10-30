"use strict";

var React = require("react");
var ReactNative = require("react-native");
var {
    Image,
    Platform,
    TouchableHighlight,
    View
} = ReactNative;

import FIcon from "react-native-vector-icons/FontAwesome";

class LightworkRow extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return this.props.checked ? (
            <FIcon name="check-square-o"
                size={20}
                style={{marginRight:10}}
                color="rgba(0,0,0,1)"
                onPress={() => this.props.onPress ? this.props.onPress(!this.props.selected) : null}
            />
        ) : (
            <FIcon
                name="square-o"
                size={20}
                style={{marginRight:10}}
                color="rgba(0,0,0,1)"
                onPress={() => this.props.onPress ? this.props.onPress(!this.props.selected) : null}
            />
        )
    }
}

export default LightworkRow;


