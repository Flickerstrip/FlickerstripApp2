import React, { Component } from "react";
import {
    NetInfo,
} from "react-native";

import Configuration from "~/constants/Configuration";

var EventEmitter = require("events").EventEmitter;
var _ = require("lodash");

class NetworkManager extends EventEmitter {
    constructor(props) {
        super(props);

        this.connected = false;
        this.internet = false;
        this.connectionChanged = this.connectionChanged.bind(this);

        NetInfo.isConnected.fetch().then(this.connectionChanged);
        NetInfo.isConnected.addEventListener('change',this.connectionChanged);

        setInterval(function() {
            NetInfo.isConnected.fetch().then(this.connectionChanged);
        }.bind(this),5000);
    }
    connectionChanged(connected) {
        this.pingServer(connected);
    }
    pingServer(connected) {
        if (connected === undefined) connected = this.connected;

        this.pingServerImpl(function(up) {
            if (this.connected == connected && this.internet == up) return;
            this.connected = connected;
            this.internet = up;
            this.emit("ConnectionStatus",this.connected,this.internet);
        }.bind(this));
    }
    hasInternet() {
        return this.internet;
    }
    isConnected() {
        return this.connected;
    }
    pingServerImpl(cb) {
        var opt = {
            method: "GET",
            timeout: 2,
            headers: {
                'cache-control':'no-cache',
                'pragma':'no-cache',
            }
        };

        var t = setTimeout(function() {
            cb(false);
        },2000);
        fetch(Configuration.LIGHTWORK_ENDPOINT,opt).then(function(res) {
            clearTimeout(t);
            if (cb) cb(true);
        }).catch(function(res) {
            clearTimeout(t);
            if (cb) cb(false);
        });
    }
}

var networkManager = new NetworkManager();
export default networkManager;

