import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    TabBarIOS,
    NavigatorIOS,
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
import SettingsMain from "~/components/SettingsMain.js";
import FlickerstripManager from "~/stores/FlickerstripManager.js";
import LightworkManager from "~/stores/LightworkManager.js";
import EditorManager from "~/stores/EditorManager.js";
import layoutStyles from "~/styles/layoutStyles";
import BulkActions from "~/actions/BulkActions.js";
import EditorActions from "~/actions/EditorActions.js";

var Tabs = require("react-native-tabs");
var NavigationBar = require("react-native-navbar");
var _ = require("lodash");

class FlickerstripApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //selectedTab: 'strips',
            //selectedTab: 'lightworks',
            //selectedTab: 'editor',
            selectedTab: 'settings',
            activeLightwork: null,
            key: null,
        }

        FlickerstripManager.on("StripUpdated",function(id) {
            this.refresh();
        }.bind(this));

        LightworkManager.on("LightworkUpdated",function(id) {
            this.refresh();
        }.bind(this));

        EditorManager.on("ActiveLightworkChanged",function(id) {
            this.setState({activeLightwork: id, selectedTab:"editor"});
        }.bind(this));
    }

    refresh() {
        this.setState({key:Math.random()});
    }

    componentWillMount() {
        FIcon.getImageSource('navicon', 30).then((source) => this.setState({ navicon: source }));
    }

    render() {
        if (!this.state.navicon) return false;

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
                        if (this.state.selectedTab == "strips") this._stripsNavigator.popToTop();
                        this.setState({
                            selectedTab: 'strips',
                        });
                    }}>
                    <View style={[layoutStyles.flexColumn, layoutStyles.marginBottomForTab]}>
                        <NavigatorIOS
                            ref={(c) => this._stripsNavigator = c}
                            initialRoute={{
                                component: StripListing,
                                title: 'Strips',
                                wrapperStyle:layoutStyles.paddingTopForNavigation,
                                rightButtonIcon: this.state.navicon, 
                                onRightButtonPress:() => {
                                    MenuButton.showMenu([
                                        {"label":"On", onPress:() => {console.log("on")}},
                                        {"label":"Off", onPress:() => {console.log("off")}},
                                        {"label":"Clear Patterns", destructive:true, onPress:() => { console.log("clearing patterns.."); }},
                                        {"label":"Cancel", cancel:true},
                                    ]);
                                }
                            }}
                            style={layoutStyles.flexColumn}
                        />
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
                    <View style={[layoutStyles.flexColumn,layoutStyles.marginBottomForTab]}>
                        <NavigatorIOS
                            initialRoute={{
                                component: LightworksMain,
                                title: 'Lightworks',
                                wrapperStyle:layoutStyles.paddingTopForNavigation,
                                rightButtonIcon: this.state.navicon, 
                                onRightButtonPress:() => { 
                                    MenuButton.showMenu([
                                        {"label":"Load Patterns", onPress:() => { BulkActions.loadSelectedLightworksToSelectedStrips() }},
                                        {"label":"Cancel", cancel:true},
                                    ]);
                                }
                            }}
                            style={layoutStyles.flexColumn}
                        />
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
                    <View style={[layoutStyles.flexColumn, layoutStyles.marginBottomForTab]}>
                        <NavigatorIOS
                            key={this.state.activeLightwork}
                            initialRoute={{
                                component: LightworkEditor,
                                passProps: { lightwork: EditorManager.getActiveLightwork() },
                                title: EditorManager.getActiveLightwork() ? EditorManager.getActiveLightwork().name : "Editor",
                                leftButtonTitle: EditorManager.getActiveLightwork() ? "Close" : undefined, 
                                onLeftButtonPress: EditorManager.getActiveLightwork() ? () => { 
                                    EditorActions.closeLightwork(EditorManager.getActiveLightwork().id)
                                } : undefined,
                                rightButtonTitle: EditorManager.getActiveLightwork() ? "Save" : "Create", 
                                onRightButtonPress: EditorManager.getActiveLightwork() ? () => { 
                                    EditorActions.saveLightwork(EditorManager.getActiveLightwork().id)
                                } : () => {
                                    EditorActions.createLightwork();
                                },
                            }}
                            style={layoutStyles.flexColumn}
                        />
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
                    <View style={[layoutStyles.flexColumn, layoutStyles.marginBottomForTab]}>
                        <NavigatorIOS
                            initialRoute={{
                                component: SettingsMain,
                                title: 'Settings',
                                wrapperStyle:layoutStyles.paddingTopForNavigation,
                            }}
                            style={layoutStyles.flexColumn}
                        />
                    </View>
                </FIcon.TabBarItemIOS>
            </TabBarIOS>
        );
    }
}

const styles = StyleSheet.create({
});

AppRegistry.registerComponent('FlickerstripApp', () => FlickerstripApp);
