import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
    SegmentedControlIOS,
} from 'react-native';

import renderIf from "~/utils/renderIf"
import UserLightworks from "~/components/UserLightworks.js";
import LightworkRepository from "~/components/LightworkRepository.js";

import layoutStyles from "~/styles/layoutStyles.js";
var _ = require("lodash");

class LightworksMain extends React.Component {
    constructor(props) {
        super(props);
        this.state = {activeTab: 0 };
    }
    render() {
        console.log("layout",layoutStyles);
        return (
            <View style={layoutStyles.flexColumn}>
                <SegmentedControlIOS
                    values={['My Lightworks','Lightwork Repository']}
                    selectedIndex={this.state.activeTab}
                    onChange={(event) => this.setState({activeTab:event.nativeEvent.selectedSegmentIndex})}
                />
                {renderIf(this.state.activeTab == 0)(
                        <UserLightworks style={layoutStyles.flexColumn} />
                )}
                {renderIf(this.state.activeTab == 1)(
                        <LightworkRepository style={layoutStyles.flexColumn}/>
                )}
            </View>
        )
    }
}

export default LightworksMain;
