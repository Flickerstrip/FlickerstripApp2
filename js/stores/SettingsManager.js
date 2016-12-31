import {
    AsyncStorage,
} from "react-native";

var EventEmitter = require("events").EventEmitter;
var _ = require("lodash");

import ActionTypes from "~/constants/ActionTypes.js";
import FlickerstripDispatcher from "~/dispatcher/FlickerstripDispatcher.js";
import LightworkService from "~/services/LightworkService.js";
import UserService from "~/services/UserService";
import NetworkManager from "~/stores/NetworkManager.js";

var asyncStorageKey = "flickerstripSettingsKey";

class SettingsManager extends EventEmitter {
    constructor(props) {
        super(props);

        this.user = null;
        this.wifi = null;
        this.userLightworks = null;
        this.storedLightworksById = null;
        this.queuedActions = null;
        this.selectedStrips = null;

        NetworkManager.on("ConnectionStatus",this.retryLogin.bind(this));

        this.loadSettings();

        FlickerstripDispatcher.register(function(e) {
            if (e.type === ActionTypes.USER_LOGIN) {
                this.user = {email: e.email, password: e.password};
                this.persistSettings();
                this.doLogin(e.email,e.password);
            } else if (e.type === ActionTypes.USER_LOGOUT) {
                this.user = null;
                this.persistSettings();
                this.emit("UserUpdated",null);
            } else if (e.type === ActionTypes.WIFI_SAVE) {
                if (e.ssid == null) {
                    this.wifi = null;
                } else {
                    this.wifi = {ssid:e.ssid,password:e.password};
                }
                this.persistSettings();
                this.emit("WiFiUpdated",null);
            } else if (e.type === ActionTypes.PURGE_LIGHTWORK_CACHE) {
                this.userLightworks = null;
                this.storedLightworksById = null;
                this.queuedActions = null;
                this.selectedStrips = null;
                this.publicLightworks = null;
                this.ipStrips = null;
                this.persistSettings();
            }
        }.bind(this));
    }
    retryLogin() {
        if (!this.user) return;

        this.doLogin(this.user.email,this.user.password);
    }
    doLogin(email,password) {
        UserService.validateUser(email,password,function(valid,user) {
            if (!valid) return this.emit("UserUpdated",this.user);
            this.user = user;
            this.user.valid = true;
            user.password = password;
            this.emit("UserUpdated",user);
        }.bind(this))
    }
    loadSettings() {
        AsyncStorage.getItem(asyncStorageKey).then(function(jsonString) {
            if (!jsonString) return;
            var json = JSON.parse(jsonString);
            _.extend(this,json);

            if (json.user && NetworkManager.hasInternet()) {
                UserService.validateUser(json.user.email,json.user.password,function(valid,user) {
                    if (!valid) {
                        this.user = json.user;
                        this.user.valid = false;

                        this.emit("SettingsLoaded");

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
    storeStrips(selectedStrips,ipStrips) {
        this.selectedStrips = selectedStrips;
        this.ipStrips = ipStrips;
        this.persistSettings();
    }
    storeLightworks(userLightworks,lightworksById, queuedActions, publicLightworks) {
        this.userLightworks = userLightworks;
        this.storedLightworksById = lightworksById;
        this.queuedActions = queuedActions;
        this.publicLightworks = publicLightworks;
        this.persistSettings();
    }
    persistSettings() {
        var save = {
            user: this.user ? {email:this.user.email,password:this.user.password,id:this.user.id} : null,
            wifi: this.wifi,
            userLightworks:this.userLightworks,
            storedLightworksById:this.storedLightworksById,
            queuedActions: this.queuedActions,
            selectedStrips: this.selectedStrips,
            publicLightworks: this.publicLightworks,
            ipStrips: this.ipStrips,
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
        return this.isUserSet() && this.user.valid == true;
    }
    isUserSet() {
        return this.user != null;
    }
    getUser() {
        return this.user;
    }
    getUserId() {
        return this.user  && this.user.id ? this.user.id : null;
    }
}

var settingsManager = new SettingsManager();
export default settingsManager;
