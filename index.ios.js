import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    TabBarIOS,
    NavigatorIOS,
} from "react-native";


/*
class DummyApp extends React.Component { render() { return (<Text>Foo</Text>) } }
AppRegistry.registerComponent("FlickerstripApp", () => DummyApp);
*/

import EIcon from "react-native-vector-icons/EvilIcons";
import NIcon from "react-native-vector-icons/Entypo";
import FIcon from "react-native-vector-icons/FontAwesome";

import MenuButton from "~/components/MenuButton.js";
import StripListing from "~/components/StripListing.js";
import LightworkEditor from "~/components/LightworkEditor.js";
import ConfigureNewStrip from "~/components/ConfigureNewStrip.js";
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
            selectedTab: "strips",
            //selectedTab: "lightworks",
            //selectedTab: "editor",
            //selectedTab: "settings",
            activeLightwork: null,
        }

        this.onActiveLightworkChanged = this.onActiveLightworkChanged.bind(this);
        this.updateSelectedStripCount = this.updateSelectedStripCount.bind(this);
        this.updateSelectedLightworksCount = this.updateSelectedLightworksCount.bind(this);
    }
    componentWillMount() {
        FIcon.getImageSource("ellipsis-v", 20).then((source) => this.setState({ stripMenuIcon: source }));
        FIcon.getImageSource("th-list", 20).then((source) => this.setState({ lightworkMenuIcon: source }));
        FIcon.getImageSource("plus", 20).then((source) => this.setState({ configureStripIcon: source }));

        FlickerstripManager.on("StripUpdated",this.updateSelectedStripCount);
        FlickerstripManager.on("StripAdded",this.updateSelectedStripCount);
        FlickerstripManager.on("StripRemoved",this.updateSelectedStripCount);
        LightworkManager.on("LightworkUpdated",this.updateSelectedLightworksCount);
        EditorManager.on("ActiveLightworkChanged",this.onActiveLightworkChanged);
    }
    componentWillUnmount() {
        FlickerstripManager.removeListener("StripUpdated",this.updateSelectedStripCount);
        FlickerstripManager.removeListener("StripAdded",this.updateSelectedStripCount);
        FlickerstripManager.removeListener("StripRemoved",this.updateSelectedStripCount);
        LightworkManager.on("LightworkUpdated",this.updateSelectedLightworksCount);
        EditorManager.removeListener("ActiveLightworkChanged",this.onActiveLightworkChanged);
    }
    onActiveLightworkChanged(id) {
        this.setState({activeLightwork: id, selectedTab:"editor"});
    }
    updateSelectedStripCount() {
        this.setState({selectedStrips: FlickerstripManager.getSelectedCount()});
    }
    updateSelectedLightworksCount() {
        this.setState({selectedLightworks: LightworkManager.getSelectedCount()});
    }
    render() {
        if (!this.state.configureStripIcon) return false;
        if (!this.state.lightworkMenuIcon) return false;
        if (!this.state.stripMenuIcon) return false;

        return (
            <TabBarIOS unselectedTintColor="#666666" tintColor="blue" barTintColor="#efefef">
                <NIcon.TabBarItemIOS
                    title="Strips"
                    iconName="signal"
                    badge={this.state.selectedStrips || null}
                    selected={this.state.selectedTab === "strips"}
                    onPress={() => {
                        if (this.state.selectedTab == "strips") this._stripsNavigator.popToTop();
                        this.setState({
                            selectedTab: "strips",
                        });
                    }}>
                    <View style={[layoutStyles.flexColumn, layoutStyles.marginBottomForTab]}>
                        <NavigatorIOS
                            ref={(c) => this._stripsNavigator = c}
                            initialRoute={{
                                component: StripListing,
                                title: "Flickerstrip",
                                wrapperStyle:layoutStyles.paddingTopForNavigation,
                                leftButtonIcon: this.state.configureStripIcon, 
                                onLeftButtonPress:() => {
                                    this._stripsNavigator.push({
                                        component: ConfigureNewStrip,
                                        title:"Add Flickerstrip",
                                        wrapperStyle:layoutStyles.paddingTopForNavigation,
                                        leftButtonTitle: "Back",
                                        onLeftButtonPress:() => {
                                            this._stripsNavigator.pop();
                                        }
                                    });
                                },
                                rightButtonIcon: this.state.stripMenuIcon, 
                                onRightButtonPress:() => {
                                    MenuButton.showMenu([
                                        (
                                            FlickerstripManager.countWhere({"power":1}) > 0
                                                ? {"label":"Off", onPress:() => BulkActions.selectedStripPowerToggle(false)}
                                                : {"label":"On", onPress:() => BulkActions.selectedStripPowerToggle(true)}
                                        ),
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
                    selected={this.state.selectedTab === "lightworks"}
                    badge={LightworkManager.getSelectedCount() || null}
                    onPress={() => {
                        this.setState({
                            selectedTab: "lightworks",
                        });
                    }}>
                    <View style={[layoutStyles.flexColumn,layoutStyles.marginBottomForTab]}>
                        <NavigatorIOS
                            initialRoute={{
                                component: LightworksMain,
                                title: "Lightworks",
                                wrapperStyle:layoutStyles.paddingTopForNavigation,
                                rightButtonIcon: this.state.lightworkMenuIcon, 
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
                    selected={this.state.selectedTab === "editor"}
                    onPress={() => {
                    this.setState({
                        selectedTab: "editor",
                    });
                    }}>
                    <View style={[layoutStyles.flexColumn, layoutStyles.marginBottomForTab]}>
                        <NavigatorIOS
                            key={this.state.activeLightwork}
                            initialRoute={{
                                component: LightworkEditor,
                                passProps: { lightwork: EditorManager.getActiveLightwork() },
                                title: EditorManager.getActiveLightwork() ? EditorManager.getActiveLightwork().name : "Editor",
                                leftButtonTitle: EditorManager.getActiveLightwork() ? "Save" : undefined, 
                                onLeftButtonPress: EditorManager.getActiveLightwork() ? () => { 
                                    EditorActions.saveLightwork(EditorManager.getActiveLightwork().id)
                                } : undefined,
                                rightButtonIcon: EditorManager.getActiveLightwork() ? this.state.stripMenuIcon : undefined,
                                rightButtonTitle: EditorManager.getActiveLightwork() ? undefined : "Create",
                                onRightButtonPress: EditorManager.getActiveLightwork() ? () => { 
                                    MenuButton.showMenu([
                                        {"label":"Rename Lightwork", onPress:() => { AlertIOS.prompt(
                                            "Rename Lightwork",
                                            null,
                                            value => EditorManager.lightworkEdited(EditorManager.getActiveLightwork().id,{name: value}),
                                            "plain-text",
                                            EditorManager.getActiveLightwork().name
                                        )}},
                                        {"label":"Close Lightwork", onPress:() => { EditorActions.closeLightwork(EditorManager.getActiveLightwork().id) }, destructive:true},
                                        {"label":"Cancel", cancel:true},
                                    ]);
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
                    selected={this.state.selectedTab === "settings"}
                    onPress={() => {
                    this.setState({
                        selectedTab: "settings",
                    });
                    }}>
                    <View style={[layoutStyles.flexColumn, layoutStyles.marginBottomForTab]}>
                        <NavigatorIOS
                            initialRoute={{
                                component: SettingsMain,
                                title: "Settings",
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

AppRegistry.registerComponent("FlickerstripApp", () => FlickerstripApp);
