import React, { Component } from "react";
import {
    NetInfo,
} from "react-native";

var EventEmitter = require("events").EventEmitter;
var _ = require("lodash");

class NetworkManager extends EventEmitter {
    constructor(props) {
        super(props);

        this.connected = false;
        this.connectionChanged = this.connectionChanged.bind(this);

        NetInfo.isConnected.fetch().then(this.connectionChanged);
        NetInfo.isConnected.addEventListener('change',this.connectionChanged);
    }
    connectionChanged(connected) {
        console.log("CONNECTED: ",connected);
        this.connected = connected;
        this.emit("ConnectionStatus",connected);
    }
    isConnected() {
        return this.connected;
    }
}

var networkManager = new NetworkManager();
export default networkManager;

