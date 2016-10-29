import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
} from "react-native";

import renderIf from "~/utils/renderIf"
import UserLightworks from "~/components/UserLightworks";
import LightworkRepository from "~/components/LightworkRepository";
import SettingsManager from "~/stores/SettingsManager";
import StatusBar from "~/components/StatusBar";
import SimpleSegmentedControl from "~/components/SimpleSegmentedControl";

import layoutStyles from "~/styles/layoutStyles.js";
var _ = require("lodash");

class LightworksMain extends React.Component {
    constructor(props) {
        super(props);
        this.state = {key: null, activeTab: 0 };

        this.refresh = this.refresh.bind(this);
    }
    componentWillMount() {
        SettingsManager.on("UserUpdated", this.refresh);
    }
    componentWillUnmount() {
        SettingsManager.on("UserUpdated", this.refresh);
    }
    refresh() {
        this.setState({key:Math.random()});
    }
    render() {
        return (
            <View style={[this.props.style, layoutStyles.flexColumn]}>
                <SimpleSegmentedControl
                    key={this.state.key}
                    values={["My Lightworks","Lightwork Repository"]}
                    selectedIndex={this.state.activeTab}
                    onChange={(index) => this.setState({activeTab:index})}
                />
                {renderIf(this.state.activeTab == 0)(
                    <UserLightworks navigator={this.props.navigator} style={layoutStyles.flexColumn} />
                )}
                {renderIf(this.state.activeTab == 1)(
                    <LightworkRepository navigator={this.props.navigator} style={layoutStyles.flexColumn}/>
                )}
                <StatusBar />
            </View>
        )
    }
}

export default LightworksMain;
