var EventEmitter = require("events").EventEmitter;
var _ = require("lodash");

import ActionTypes from "~/constants/ActionTypes.js";
import FlickerstripDispatcher from "~/dispatcher/FlickerstripDispatcher.js";
import LightworkService from "~/services/LightworkService.js";
import UserService from "~/services/UserService";

class SettingsManager extends EventEmitter {
    constructor(props) {
        super(props);

        this.user = null;
        this.wifi = null;

        FlickerstripDispatcher.register(function(e) {
            if (e.type === ActionTypes.USER_LOGIN) {
                UserService.validateUser(e.email,e.password,function(valid,user) {
                    if (!valid) return;

                    console.log("set user",user);
                    this.user = user;
                    this.emit("UserUpdated",user);
                }.bind(this))
            }
        }.bind(this));
    }
    isWiFiSet() {
        return this.wifi != null;
    }
    getWiFi() {
        return this.wifi;
    }
    isUserSet() {
        return this.user != null;
    }
    getUser() {
        return this.user;
    }
    getUserId() {
        return this.user ? this.user.id : null;
    }
}

var settingsManager = new SettingsManager();
export default settingsManager;
