import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
} from "react-native";

var _ = require("lodash");

import Prompt from 'react-native-prompt';
import LightworkConfiguration from "~/components/LightworkConfiguration.js";
import LightworkRow from "~/components/LightworkRow.js";
import LightworkEditor from "~/components/LightworkEditor.js";
import EditorActions from "~/actions/EditorActions.js";
import layoutStyles from "~/styles/layoutStyles";
import skinStyles from "~/styles/skinStyles";
import LightworkManager from "~/stores/LightworkManager.js";
import LightworkActions from "~/actions/LightworkActions.js";
import BulkActions from "~/actions/BulkActions.js";
import SettingsManager from "~/stores/SettingsManager";
import MenuButton from "~/components/MenuButton";

class UserLightworks extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            key: null,
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }).cloneWithRows([]),
            promptName:"",
            promptPlaceholder:"",
            promptValue:"",
            showPrompt:false,
            promptCallback:(value) => {},
        };

        this.refreshUserLightworks = this.refreshUserLightworks.bind(this);
    }
    componentWillMount() {
        LightworkManager.on("UserLightworkListUpdated",this.refreshUserLightworks);
        SettingsManager.on("UserUpdated",this.refreshUserLightworks);
        this.refreshUserLightworks();
    }
    componentWillUnmount() {
        LightworkManager.removeListener("UserLightworkListUpdated",this.refreshUserLightworks);
        SettingsManager.removeListener("UserUpdated",this.refreshUserLightworks);
    }
    rowDrilldownPressed(lw) {
        EditorActions.openLightwork(lw.id);
    }
    renderRow(lightwork: Object,sectionID: number | string,rowID: number | string, highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void) {
        return (
            <LightworkRow
                lightwork     = {lightwork}
                showPublished = {true}
                selected      = {() => lightwork.selected || false}
                onDrilldown   = {() => this.rowDrilldownPressed(lightwork)}
                onPress       = {() => LightworkManager.getSelectedCount() == 0 ? BulkActions.previewLightworkOnSelectedStrips(lightwork.id) : lightwork.selected ? LightworkActions.deselectLightwork(lightwork.id) : LightworkActions.selectLightwork(lightwork.id)}
                onSelectToggle= {() => lightwork.selected ? LightworkActions.deselectLightwork(lightwork.id) : LightworkActions.selectLightwork(lightwork.id)}
                onLongPress   = {() => MenuButton.showMenu([
                    {"label":"Preview Lightwork", onPress:() => BulkActions.previewLightworkOnSelectedStrips(lightwork.id) },
                    {"label":"Load Lightwork", onPress:() => BulkActions.loadLightworkToSelectedStrips(lightwork.id) },
                    {"label":"Configure Lightwork", onPress:() => {
                        this.props.navigator.push({
                            component: LightworkConfiguration,
                            center: {text:lightwork.name},
                            passProps: { lightwork: lightwork },
                            left:{
                                text: "Back",
                                onPress:() => {
                                    this.props.navigator.pop();
                                }
                            }
                        });
                    }},
                    {"label":"Duplicate Lightwork", onPress:() => { 
                        console.log("setting state");
                        this.setState({
                            key: Math.random(),
                            promptName:"Duplicate Lightwork",
                            promptPlaceholder:"Lightwork name",
                            promptValue:lightwork.name+" Copy",
                            showPrompt:true,
                            promptCallback:(value) => LightworkActions.duplicateLightwork(lightwork.id,value),
                        });
                    }},
                    //{"label":"Star Lightwork", onPress:() => { LightworkActions.starLightwork(lightwork.id,!lightwork.starred) }},
                    {"label":(lightwork.published ? "Unpublish" : "Publish") + " Lightwork", onPress:() => { LightworkActions.publishLightwork(lightwork.id,!lightwork.published) }},
                    {"label":"Rename Lightwork", onPress:() => { 
                        this.setState({
                            promptName:"Rename Lightwork",
                            promptPlaceholder:"Lightwork name",
                            promptValue:lightwork.name,
                            showPrompt:true,
                            promptCallback:(value) => LightworkActions.editLightwork(lightwork.id,{name:value}),
                        });
                    }},
                    {"label":"Delete Lightwork", destructive:true, onPress:() => { LightworkActions.deleteLightwork(lightwork.id) }},
                    {"label":"Cancel", cancel:true},
                ]) }
            />
        );
    }
    refreshUserLightworks() {
        this.loading = true;
        LightworkManager.getUserLightworks(SettingsManager.getUserId(),function(result) {
            //console.log("got results",result.length,result);
            this.loading = false;
            if (result == null) return;
            this.updateDatasource(result);
        }.bind(this));
    }
    updateDatasource(data) {
        setTimeout(function() {
            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(data.slice(0))
            });
        }.bind(this),0)
    }
    renderHeader() {
        return (
            <View key={this.state.key}>
                {/* What is going on here?? for some reason a small visible element here fixes a bug that makes the Prompt fail to display TODO fixme */}
                <Text style={{height: 2, color: "white"}}></Text> 
                <Prompt
                    key={this.state.key+"_prompt"}
                    title={this.state.promptName}
                    placeholder={this.state.promptPlaceholder}
                    defaultValue={this.state.promptValue}
                    visible={ this.state.showPrompt }
                    onCancel={ () => this.setState({showPrompt:false}) }
                    onSubmit={(value) => {
                        this.setState({showPrompt: false});
                        this.state.promptCallback(value);
                    }}
                />
                {SettingsManager.isUserValid() ? null : (<Text>Note: You are not logged in, Lightworks are stored locally, log in to preserve them!</Text>)}
            </View>
        )
    }
    render() {
        return this.state.dataSource.getRowCount() == 0 ? (
            <View style={layoutStyles.centerChildren}>
                <View style={skinStyles.notePanel}>
                    <Text style={[skinStyles.noteText]}>
                        {SettingsManager.isUserValid() ? "Your Lightworks list is empty, create Lightworks in the editor to get started." : "You are not logged in, log in or create a Lightwork in the editor"}
                    </Text>
                </View>
            </View>
        ) : (
            <ListView
                style={{flex: 1}}
                dataSource={this.state.dataSource}
                enableEmptySections={true}
                renderRow={this.renderRow.bind(this)}
                renderHeader={this.renderHeader.bind(this)}
                automaticallyAdjustContentInsets={false}
            />
        )
    }
}

export default UserLightworks;



