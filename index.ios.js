import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    NavigatorIOS,
} from "react-native";


/*
class DummyApp extends React.Component { render() { return (<Text>Foo</Text>) } }
AppRegistry.registerComponent("FlickerstripApp", () => DummyApp);
*/

import TabNavigator from 'react-native-tab-navigator';
import Prompt from 'react-native-prompt';
import ActionSheet from '@exponent/react-native-action-sheet';

import EIcon from "react-native-vector-icons/EvilIcons";
import NIcon from "react-native-vector-icons/Entypo";
import FIcon from "react-native-vector-icons/FontAwesome";

import NetworkManager from "~/stores/NetworkManager.js";
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
import ComponentManager from "~/stores/ComponentManager.js";

var flattenStyle = require('flattenStyle')

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
            activeLightworkVersion: null,
            showRenamePrompt: false,
        }

        this.onActiveLightworkChanged = this.onActiveLightworkChanged.bind(this);
        this.updateSelectedStripCount = this.updateSelectedStripCount.bind(this);
        this.updateSelectedLightworksCount = this.updateSelectedLightworksCount.bind(this);
        this.onLightworkUpdated = this.onLightworkUpdated.bind(this);
        this.onActiveLightworkUpdated = this.onActiveLightworkUpdated.bind(this);
    }
    componentWillMount() {
        FIcon.getImageSource("ellipsis-v", 20).then((source) => this.setState({ stripMenuIcon: source }));
        FIcon.getImageSource("th-list", 20).then((source) => this.setState({ lightworkMenuIcon: source }));
        FIcon.getImageSource("plus", 20).then((source) => this.setState({ configureStripIcon: source }));

        FlickerstripManager.on("StripUpdated",this.updateSelectedStripCount);
        FlickerstripManager.on("StripAdded",this.updateSelectedStripCount);
        FlickerstripManager.on("StripRemoved",this.updateSelectedStripCount);
        LightworkManager.on("LightworkUpdated",this.onLightworkUpdated);
        EditorManager.on("ActiveLightworkChanged",this.onActiveLightworkChanged);
        EditorManager.on("ActiveLightworkUpdated",this.onActiveLightworkUpdated);
    }
    componentWillUnmount() {
        FlickerstripManager.removeListener("StripUpdated",this.updateSelectedStripCount);
        FlickerstripManager.removeListener("StripAdded",this.updateSelectedStripCount);
        FlickerstripManager.removeListener("StripRemoved",this.updateSelectedStripCount);
        LightworkManager.on("LightworkUpdated",this.onLightworkUpdated);
        EditorManager.removeListener("ActiveLightworkChanged",this.onActiveLightworkChanged);
    }
    onActiveLightworkChanged(id) {
        this.setState({activeLightwork: id, selectedTab:"editor"});
    }
    onActiveLightworkUpdated() {
        console.log("active lightwork updated!");
        this.setState({activeLightworkVersion: Math.random()});
    }
    onLightworkUpdated(id) {
        this.updateSelectedLightworksCount();
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

        var tabBarIconSize = 20;

        return (
            <ActionSheet ref={component => ComponentManager.actionSheet = component}>
            <TabNavigator tabBar={styles.tabBar}>
                <TabNavigator.Item
                    title="Strips"
                    titleStyle={styles.tabTitle}
                    selectedTitleStyle={styles.tabTitleSelected}
                    renderIcon={() => <NIcon name="signal" color={flattenStyle(styles.tabTitle).color} size={tabBarIconSize} />}
                    renderSelectedIcon={() => <NIcon name="signal" color={flattenStyle(styles.tabTitleSelected).color} size={tabBarIconSize} />}
                    badgeText={this.state.selectedStrips || null}
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
                </TabNavigator.Item>

                <TabNavigator.Item
                    title="Lightworks"
                    titleStyle={styles.tabTitle}
                    selectedTitleStyle={styles.tabTitleSelected}
                    renderIcon={() => <FIcon name="cube" color={flattenStyle(styles.tabTitle).color} size={tabBarIconSize} />}
                    renderSelectedIcon={() => <FIcon name="cube" color={flattenStyle(styles.tabTitleSelected).color} size={tabBarIconSize} />}
                    selected={this.state.selectedTab === "lightworks"}
                    badgeText={LightworkManager.getSelectedCount() || null}
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
                </TabNavigator.Item>
                <TabNavigator.Item
                    title="Editor"
                    titleStyle={styles.tabTitle}
                    selectedTitleStyle={styles.tabTitleSelected}
                    renderIcon={() => <FIcon name="pencil" color={flattenStyle(styles.tabTitle).color} size={tabBarIconSize} />}
                    renderSelectedIcon={() => <FIcon name="pencil" color={flattenStyle(styles.tabTitleSelected).color} size={tabBarIconSize} />}
                    selected={this.state.selectedTab === "editor"}
                    onPress={() => {
                    this.setState({
                        selectedTab: "editor",
                    });
                    }}>
                    <View style={[layoutStyles.flexColumn, layoutStyles.marginBottomForTab]}>
                        <NavigatorIOS
                            key={this.state.activeLightwork+this.state.activeLightworkVersion}
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
                                        {"label":"Preview Lightwork", onPress:() => { BulkActions.previewLightworkOnSelectedStrips(EditorManager.getActiveLightwork().id) }},
                                        {"label":"Load Lightwork", onPress:() => { BulkActions.previewLightworkOnSelectedStrips(EditorManager.getActiveLightwork().id) }},
                                        {"label":"Rename Lightwork", onPress:() => {
                                            this.setState({showRenamePrompt:true});
                                        }},
                                        {"label":"New Lightwork", onPress:() => { EditorActions.createLightwork() } },
                                        {"label":"Close Lightwork", onPress:() => { EditorActions.closeLightwork(EditorManager.getActiveLightwork().id) }, destructive:true},
                                        {"label":"Cancel", cancel:true},
                                    ]);
                                } : () => {
                                    EditorActions.createLightwork();
                                },
                            }}
                            style={layoutStyles.flexColumn}
                        />
                        <Prompt
                            title="Rename Lightwork"
                            placeholder="Lightwork name"
                            defaultValue={EditorManager.getActiveLightwork().name}
                            visible={ this.state.showRenamePrompt }
                            onCancel={ () => this.setState({showRenamePrompt:false}) }
                            onSubmit={(value) => {
                                this.setState({showRenamePrompt: false});
                                EditorManager.lightworkEdited(EditorManager.getActiveLightwork().id,{name: value})
                            }}
                        />
                    </View>
                </TabNavigator.Item>

                <TabNavigator.Item
                    title="Settings"
                    titleStyle={styles.tabTitle}
                    selectedTitleStyle={styles.tabTitleSelected}
                    renderIcon={() => <FIcon name="cogs" color={flattenStyle(styles.tabTitle).color} size={tabBarIconSize} />}
                    renderSelectedIcon={() => <FIcon name="cogs" color={flattenStyle(styles.tabTitleSelected).color} size={tabBarIconSize} />}
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
                </TabNavigator.Item>
            </TabNavigator>
            </ActionSheet>
        );
    }
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor:"#eee",
    },
    tabTitle: {
        color: "#666666",
    },
    tabTitleSelected: {
        color: "#00f",
    }
});

AppRegistry.registerComponent("FlickerstripApp", () => FlickerstripApp);
