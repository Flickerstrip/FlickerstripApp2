import React, { Component } from "react";
import {
    View,
    Text,
    TouchableOpacity,
} from "react-native";

var SimpleSegmentedControl = React.createClass({
    getInitialState: function () {
        return {
            values: this.props.values || [],
            selectedIndex: this.props.selectedIndex || 0,
            style: this.props.style || {},
            onChange: this.props.onChange
        };
    },

    componentWillReceiveProps: function (props) {
        this.setState(props);
    },

    onPress: function (selectedIndex) {
        if (typeof this.state.onChange === 'function') {
            return this.state.onChange(selectedIndex);
        }
    },

    render: function () {
        return (
            <View style={[{flexDirection: 'row', borderWidth: 1, borderColor: '#007AFF', borderRadius: 5, margin: 2}, this.state.style]}>
                {this.state.values.map(function (value, position, values) {
                    return (
                        <TouchableOpacity key={position} onPress={()=>this.onPress(position)} style={{flex: 1}}>
                            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', padding: 5,
                            backgroundColor: this.state.selectedIndex == position ? '#007AFF' : 'transparent',
                            borderRightWidth: position < values.length - 1 ? 1 : 0, borderRightColor: '#007AFF'}}>
                                <Text style={{fontSize: 13, color: this.state.selectedIndex == position ? 'white' : '#007AFF'}}>{value}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                }.bind(this))}
            </View>
        );
    }
});

module.exports = SimpleSegmentedControl;
