import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    TabBarIOS
} from 'react-native';


/*
class DummyApp extends React.Component { render() { return (<Text>Foo</Text>) } }
AppRegistry.registerComponent('FlickerstripApp', () => DummyApp);
*/

import EIcon from "react-native-vector-icons/EvilIcons";
import NIcon from "react-native-vector-icons/Entypo";
import FIcon from "react-native-vector-icons/FontAwesome";

import MenuButton from "~/components/MenuButton.js";
import StripListing from "~/components/StripListing.js";
import LightworkEditor from "~/components/LightworkEditor.js";
import LightworksMain from "~/components/LightworksMain.js";
import FlickerstripManager from "~/stores/FlickerstripManager.js";
import LightworkManager from "~/stores/LightworkManager.js";
import layoutStyles from "~/styles/layoutStyles";

var Tabs = require("react-native-tabs");
var NavigationBar = require("react-native-navbar");
var _ = require("lodash");

class FlickerstripApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //selectedTab: 'strips',
            selectedTab: 'lightworks',
            //selectedTab: 'editor',
            key: null,
        }

        FlickerstripManager.on("StripUpdated",function(id) {
            this.refresh();
        }.bind(this));

        LightworkManager.on("LightworkUpdated",function(id) {
            console.log("got lightwork updated");
            this.refresh();
        }.bind(this));
    }

    refresh() {
        this.setState({key:Math.random()});
    }

    render() {
        var rightButtonConfig = {
            title: 'Next',
            handler: function onNext() {
                alert('hello!');
            }
        };

        return (
            <TabBarIOS unselectedTintColor="yellow" tintColor="white" barTintColor="darkslateblue">
                <NIcon.TabBarItemIOS
                    title="Strips"
                    iconName="signal"
                    badge={FlickerstripManager.getSelectedCount() || null}
                    selected={this.state.selectedTab === 'strips'}
                    onPress={() => {
                    this.setState({
                        selectedTab: 'strips',
                    });
                    }}>
                    <View style={[layoutStyles.flexColumn, styles.marginBottomForTab]}>
                        <NavigationBar
                        title={{title:'Strips'}}
                        rightButton={(<MenuButton name="navicon" 
                            options={_.compact([
                                {"label":"On", onPress:() => {console.log("on")}},
                                {"label":"Off", onPress:() => {console.log("off")}},
                                {"label":"Clear Patterns", destructive:true, onPress:() => {console.log("clear")}},
                                {"label":"Cancel", cancel:true},
                            ])}
                        />)}
                        />
                        <StripListing style={layoutStyles.flexColumn}/>
                    </View>
                </NIcon.TabBarItemIOS>

                <FIcon.TabBarItemIOS
                    title="Lightworks"
                    iconName="cube"
                    selected={this.state.selectedTab === 'lightworks'}
                    badge={LightworkManager.getSelectedCount() || null}
                    onPress={() => {
                    this.setState({
                        selectedTab: 'lightworks',
                    });
                    }}>
                    <View style={[layoutStyles.flexColumn,styles.marginBottomForTab]}>
                        <NavigationBar
                            title={{title:'Lightworks'}}
                        />
                        <LightworksMain style={[layoutStyles.flexColumn]} />
                    </View>
                </FIcon.TabBarItemIOS>
                <FIcon.TabBarItemIOS
                    title="Editor"
                    iconName="pencil"
                    selected={this.state.selectedTab === 'editor'}
                    onPress={() => {
                    this.setState({
                        selectedTab: 'editor',
                    });
                    }}>
                    <View style={[layoutStyles.flexColumn, styles.marginBottomForTab]}>
                        <NavigationBar
                            title={{title:'Editor'}}
                        />
                        <LightworkEditor />
                    </View>
                </FIcon.TabBarItemIOS>

                <FIcon.TabBarItemIOS
                    title="Settings"
                    iconName="cogs"
                    selected={this.state.selectedTab === 'settings'}
                    onPress={() => {
                    this.setState({
                        selectedTab: 'settings',
                    });
                    }}>
                    <View style={[layoutStyles.flexColumn, styles.marginBottomForTab]}>
                        <NavigationBar
                            title={{title:'Settings'}}
                        />
                        <Text>Settings</Text>
                    </View>
                </FIcon.TabBarItemIOS>
            </TabBarIOS>
        );
    }
}

const styles = StyleSheet.create({
    marginBottomForTab:{
        marginBottom: 50
    },
});

AppRegistry.registerComponent('FlickerstripApp', () => FlickerstripApp);
