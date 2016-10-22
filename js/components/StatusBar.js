import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
} from "react-native";

var _ = require("lodash");

import TaskManager from "~/stores/TaskManager";
import NetworkManager from "~/stores/NetworkManager";
import layoutStyles from "~/styles/layoutStyles";

class StatusBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {key: null};

        this.refresh = this.refresh.bind(this);
    }
    componentWillMount() {
        TaskManager.on("StatusUpdated",this.refresh);
        NetworkManager.on("ConnectionStatus",this.refresh);

        //this.startTestTask();
    }
    componentWillUnmount() {
        TaskManager.removeListener("StatusUpdated",this.refresh);
        NetworkManager.removeListener("ConnectionStatus",this.refresh);
    }
    startTestTask() {
        var taskId = TaskManager.start(1,"test",{ name:"test", totalSteps:10});
        var timer = setInterval(function() {
            if (TaskManager.updateProgress(taskId,true,null,true)) {
                clearInterval(timer);
            }
        },500);
    }
    refresh() {
        this.setState({key:Math.random});
    }
    render() {
        var task = TaskManager.getActiveTask();
        var activeTaskText = task == null ? "" : task.name + (task.text ? " ["+task.text+"]" : "") + (task.currentStep ? " "+task.currentStep+"/"+task.totalSteps : "");
        var fill = task == null ? 0 : task.progress / 100.0;
        if (!task && !NetworkManager.hasInternet()) {
            task = true;
            activeTaskText = "Offline";
            fill = 1;
        }
        return (
            <View key={this.state.key} style={[{height: task ? 15 : 0},layoutStyles.flexRow, layoutStyles.flexAlignStretch]}>
                <View style={{flex: fill, backgroundColor:"#c4daff"}}></View>
                <View style={{flex: 1-fill, backgroundColor:"white"}}></View>
                <View style={[layoutStyles.flexRow, layoutStyles.flexCenter, {position:"absolute",top:0,left:0,right:0,bottom:0, backgroundColor:"rgba(0,0,0,0)"}]}>
                    <Text style={{flex:0, fontSize:10}}>{activeTaskText}</Text>
                </View>
            </View>
        )
    }
}

export default StatusBar;

