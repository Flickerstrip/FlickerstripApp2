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
import renderIf from "~/utils/renderIf"

class LightworkRow extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        var width = 20;
        var marginRight = 15;
        return (
            <View>
                {(this.props.checked) ? (
                    <FIcon name="check-square-o"
                        size={20}
                        style={{width: width,marginRight:marginRight}}
                        color="rgba(0,0,0,1)"
                        onPress={() => this.props.onPress ? this.props.onPress(!this.props.selected) : null}
                    />
                ) : (
                <FIcon
                    name="square-o"
                    size={20}
                    style={{width: width,marginRight:marginRight}}
                    color="rgba(0,0,0,1)"
                    onPress={() => this.props.onPress ? this.props.onPress(!this.props.selected) : null}
                />
                )}
            </View>
        )
    }
}

export default LightworkRow;


