import {
    AsyncStorage,
} from "react-native";

var EventEmitter = require("events").EventEmitter;
var _ = require("lodash");

import ActionTypes from "~/constants/ActionTypes.js";
import FlickerstripDispatcher from "~/dispatcher/FlickerstripDispatcher.js";
import LightworkService from "~/services/LightworkService.js";
import UserService from "~/services/UserService";

var asyncStorageKey = "flickerstripSettingsKey";

class SettingsManager extends EventEmitter {
    constructor(props) {
        super(props);

        this.user = null;
        this.wifi = null;

        this.loadSettings();

        FlickerstripDispatcher.register(function(e) {
            if (e.type === ActionTypes.USER_LOGIN) {
                UserService.validateUser(e.email,e.password,function(valid,user) {
                    if (!valid) return;

                    this.user = user;
                    user.password = e.password;
                    this.saveSettings();
                    this.emit("UserUpdated",user);
                }.bind(this))
            } else if (e.type === ActionTypes.USER_LOGOUT) {
                this.user = null;
                this.saveSettings();
                this.emit("UserUpdated",null);
            } else if (e.type === ActionTypes.WIFI_SAVE) {
                if (e.ssid == null) {
                    this.wifi = null;
                } else {
                    this.wifi = {ssid:e.ssid,password:e.password};
                }
                this.saveSettings();
                this.emit("WiFiUpdated",null);
            }
        }.bind(this));
    }
    loadSettings() {
        AsyncStorage.getItem(asyncStorageKey).then(function(jsonString) {
            if (!jsonString) return;
            var json = JSON.parse(jsonString);
            _.extend(this,json);

            if (json.user) {
                UserService.validateUser(json.user.email,json.user.password,function(valid,user) {
                    if (!valid) {
                        this.user = {
                            email: json.user.email,
                            password: json.user.password,
                            valid: false,
                        }
                        return;
                    }

                    this.user = user;
                    this.user.valid = true;
                    user.password = json.user.password;

                    this.emit("SettingsLoaded");
                }.bind(this));
            } else {
                this.emit("SettingsLoaded");
            }
        }.bind(this));
    }
    saveSettings() {
        var save = {
            user: this.user ? {email:this.user.email,password:this.user.password} : null,
            wifi: this.wifi,
        }
        AsyncStorage.setItem(asyncStorageKey,JSON.stringify(save)); //check for errors?
    }
    isWiFiSet() {
        return this.wifi != null;
    }
    getWiFi() {
        return this.wifi;
    }
    isUserValid() {
        return this.isUserSet() && this.user.valid;
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
