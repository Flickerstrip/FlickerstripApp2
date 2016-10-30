import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Navigator,
    Platform,
    TouchableHighlight,
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
import skinStyles from "~/styles/skinStyles";
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
    generateTitleButton(info,isTitle) {
        if (!info) return null;

        var content = null;
        if (info.text) content = (<Text style={isTitle?skinStyles.navigationTitle:skinStyles.navigationTextButton}>{info.text}</Text>);
        if (info.render) content = info.render();

        var containerStyles = [{padding:10,justifyContent:"center",flex:1}];

        if (info.onPress) {
            return (<TouchableHighlight style={containerStyles} onPress={info.onPress}>{content}</TouchableHighlight>);
        } else {
            return (<View style={containerStyles}>{content}</View>);
        }
    }
    renderNavigationBar() {
        return (
            <Navigator.NavigationBar
                routeMapper={{
                    LeftButton: (route) => this.generateTitleButton(route.left),
                    RightButton: (route) => this.generateTitleButton(route.right),
                    Title: (route) => this.generateTitleButton(route.center,true),
                }}
                style={skinStyles.navigationBar}
            />
        );

    }
    sceneRenderer(route, navigator) {
        return (
            <View style={[layoutStyles.flexColumn,layoutStyles.paddingTopForNavigation,{backgroundColor:"white"}]}>
                <route.component
                    route={route}
                    navigator={navigator}
                    {...route.passProps}
                />
            </View>
        );
    }
    render() {
        return (
            <ActionSheet ref={component => ComponentManager.actionSheet = component}>
            <TabNavigator tabBarStyle={skinStyles.tabBar}>
                <TabNavigator.Item
                    title="Strips"
                    titleStyle={skinStyles.tabTitle}
                    selectedTitleStyle={skinStyles.tabTitleSelected}
                    renderIcon={() => <NIcon name="signal" color={flattenStyle(skinStyles.tabTitle).color} size={skinStyles.tabBarIconSize} />}
                    renderSelectedIcon={() => <NIcon name="signal" color={flattenStyle(skinStyles.tabTitleSelected).color} size={skinStyles.tabBarIconSize} />}
                    badgeText={this.state.selectedStrips || null}
                    selected={this.state.selectedTab === "strips"}
                    onPress={() => {
                        if (this.state.selectedTab == "strips") this._stripsNavigator.popToTop();
                        this.setState({
                            selectedTab: "strips",
                        });
                    }}>
                    <View style={[layoutStyles.flexColumn,layoutStyles.statusBarMarginTop]}>
                        <Navigator
                            ref={(c) => this._stripsNavigator = c}
                            initialRoute={{
                                component: StripListing,
                                center: {text: "Flickerstrip" },
                                left: {
                                    render:() => (<FIcon size={20} name="plus" style={skinStyles.navIcon} />), 
                                    onPress:() => {
                                        this._stripsNavigator.push({
                                            component: ConfigureNewStrip,
                                            center: {text:"Add Flickerstrip"},
                                            left:{
                                                text: "Back",
                                                onPress:() => {
                                                    this._stripsNavigator.pop();
                                                }
                                            }
                                        });
                                    },
                                },
                                right: {
                                    render:() => (<FIcon size={20} name="ellipsis-v" style={skinStyles.navIcon} />), 
                                    onPress:() => {
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
                                }
                            }}
                            style={layoutStyles.flexColumn}
                            navigationBar={this.renderNavigationBar()}
                            renderScene={this.sceneRenderer.bind(this)}
                        />
                    </View>
                </TabNavigator.Item>

                <TabNavigator.Item
                    title="Lightworks"
                    titleStyle={skinStyles.tabTitle}
                    selectedTitleStyle={skinStyles.tabTitleSelected}
                    renderIcon={() => <FIcon name="cube" color={flattenStyle(skinStyles.tabTitle).color} size={skinStyles.tabBarIconSize} />}
                    renderSelectedIcon={() => <FIcon name="cube" color={flattenStyle(skinStyles.tabTitleSelected).color} size={skinStyles.tabBarIconSize} />}
                    selected={this.state.selectedTab === "lightworks"}
                    badgeText={LightworkManager.getSelectedCount() || null}
                    onPress={() => {
                        this.setState({
                            selectedTab: "lightworks",
                        });
                    }}>
                    <View style={[layoutStyles.flexColumn,layoutStyles.statusBarMarginTop]}>
                        <Navigator
                            style={layoutStyles.flexColumn}
                            initialRoute={{
                                component: LightworksMain,
                                center:{text: "Lightworks"},
                                right:{
                                    render:() => (<FIcon size={20} name="th-list" style={skinStyles.navIcon} />), 
                                    onPress:() => { 
                                        MenuButton.showMenu([
                                            {"label":"Load Patterns", onPress:() => { BulkActions.loadSelectedLightworksToSelectedStrips() }},
                                            {"label":"Cancel", cancel:true},
                                        ]);
                                    }
                                }
                            }}
                            navigationBar={this.renderNavigationBar()}
                            renderScene={this.sceneRenderer.bind(this)}
                        />
                    </View>
                </TabNavigator.Item>
                <TabNavigator.Item
                    title="Editor"
                    titleStyle={skinStyles.tabTitle}
                    selectedTitleStyle={skinStyles.tabTitleSelected}
                    renderIcon={() => <FIcon name="pencil" color={flattenStyle(skinStyles.tabTitle).color} size={skinStyles.tabBarIconSize} />}
                    renderSelectedIcon={() => <FIcon name="pencil" color={flattenStyle(skinStyles.tabTitleSelected).color} size={skinStyles.tabBarIconSize} />}
                    selected={this.state.selectedTab === "editor"}
                    onPress={() => {
                    this.setState({
                        selectedTab: "editor",
                    });
                    }}>
                    <View style={[layoutStyles.flexColumn,layoutStyles.statusBarMarginTop]}>
                        <Navigator
                            key={this.state.activeLightwork+this.state.activeLightworkVersion}
                            initialRoute={{
                                component: LightworkEditor,
                                passProps: { lightwork: EditorManager.getActiveLightwork() },
                                center:{text: EditorManager.getActiveLightwork() ? EditorManager.getActiveLightwork().name : "Editor"},
                                left:{
                                    text: EditorManager.getActiveLightwork() ? "Save" : undefined, 
                                    onPress: EditorManager.getActiveLightwork() ? () => { 
                                        EditorActions.saveLightwork(EditorManager.getActiveLightwork().id)
                                    } : undefined,
                                },
                                right: EditorManager.getActiveLightwork() ? {
                                        render:() => (<FIcon size={20} name="ellipsis-v" style={skinStyles.navIcon} />),
                                        onPress:() => MenuButton.showMenu([
                                            {"label":"Preview Lightwork", onPress:() => { BulkActions.previewLightworkOnSelectedStrips(EditorManager.getActiveLightwork().id) }},
                                            {"label":"Load Lightwork", onPress:() => { BulkActions.previewLightworkOnSelectedStrips(EditorManager.getActiveLightwork().id) }},
                                            {"label":"Rename Lightwork", onPress:() => {
                                                this.setState({showRenamePrompt:true});
                                            }},
                                            {"label":"New Lightwork", onPress:() => { EditorActions.createLightwork() } },
                                            {"label":"Close Lightwork", onPress:() => { EditorActions.closeLightwork(EditorManager.getActiveLightwork().id) }, destructive:true},
                                            {"label":"Cancel", cancel:true},
                                        ]),
                                    } : {
                                        text: "Create",
                                        onPress:() => {
                                            EditorActions.createLightwork();
                                        },
                                    }
                            }}
                            style={layoutStyles.flexColumn}
                            navigationBar={this.renderNavigationBar()}
                            renderScene={this.sceneRenderer.bind(this)}
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
                    titleStyle={skinStyles.tabTitle}
                    selectedTitleStyle={skinStyles.tabTitleSelected}
                    renderIcon={() => <FIcon name="cogs" color={flattenStyle(skinStyles.tabTitle).color} size={skinStyles.tabBarIconSize} />}
                    renderSelectedIcon={() => <FIcon name="cogs" color={flattenStyle(skinStyles.tabTitleSelected).color} size={skinStyles.tabBarIconSize} />}
                    selected={this.state.selectedTab === "settings"}
                    onPress={() => {
                    this.setState({
                        selectedTab: "settings",
                    });
                    }}>
                    <View style={[layoutStyles.flexColumn,layoutStyles.statusBarMarginTop]}>
                        <Navigator
                            initialRoute={{
                                component: SettingsMain,
                                center:{text: "Settings"},
                            }}
                            style={layoutStyles.flexColumn}
                            navigationBar={this.renderNavigationBar()}
                            renderScene={this.sceneRenderer.bind(this)}
                        />
                    </View>
                </TabNavigator.Item>
            </TabNavigator>
            </ActionSheet>
        );
    }
}

const styles = StyleSheet.create({
});

export default FlickerstripApp;
