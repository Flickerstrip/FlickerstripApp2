import {
    AsyncStorage,
} from "react-native";

var EventEmitter = require("events").EventEmitter;
var _ = require("lodash");
var RNFS = require('react-native-fs');

import ActionTypes from "~/constants/ActionTypes.js";
import FlickerstripDispatcher from "~/dispatcher/FlickerstripDispatcher.js";
import NetworkManager from "~/stores/NetworkManager";
import Configuration from "~/constants/Configuration";

class UpdateManager extends EventEmitter {
    constructor(props) {
        super(props);

        FlickerstripDispatcher.register(function(e) {
        }.bind(this));

        this.latestRelease = null;
        this.prepareFirmwareFolder().then(function() {
            this.checkForUpdates();
        }.bind(this));

        NetworkManager.on("ConnectionStatus",this.checkForUpdates.bind(this));
    }
    prepareFirmwareFolder() {
        return RNFS.exists(RNFS.DocumentDirectoryPath+"/firmware").then(function(exists) {
            if (!exists) return RNFS.mkdir(RNFS.DocumentDirectoryPath+"/firmware",{NSURLIsExcludedFromBackupKey:true});
        });
    }
    checkForUpdates() {
        var opt = {
            headers: {
                "User-Agent":"Flickerstrip-App",
                "cache-control":"no-cache",
                "pragma":"no-cache",
            }
        }
        fetch(Configuration.FIRMWARE_LOCATION+"/latest.json",opt).then((response) => response.json()).then(function(json) {
            this.latestRelease = json;
            this.emit("LatestReleaseUpdated",this.latestRelease.latest);
            return this.isVersionDownloaded(this.latestRelease.latest).then(function(isDownloaded) {
                if (!isDownloaded) return this.downloadFirmwareVersion(this.latestRelease.latest).then(function() {
                }.bind(this));
            }.bind(this));
        }.bind(this));
    }
    isVersionDownloaded(version) {
        return RNFS.exists(RNFS.DocumentDirectoryPath+"/firmware/"+version+".bin");
    }
    getLatestVersion() {
        return this.latestRelease ? this.latestRelease.latest : null;
    }
    downloadFirmwareVersion(version) {
        var downloadPath = Configuration.FIRMWARE_LOCATION+"/"+version+".bin";
        return RNFS.downloadFile({
            fromUrl: downloadPath,
            toFile: RNFS.DocumentDirectoryPath+"/firmware/"+version+".bin",
        }).promise;
    }
    compareLatestVersion(version) {
        if (!this.latestRelease) return null;

        var latest = UpdateManager.symanticVersionToNumeric(this.latestRelease.latest);
        var test = UpdateManager.symanticVersionToNumeric(version);

        if (latest == test) return 0;
        if (latest > test) return -1;
        if (latest < test) return 1;
    }
    static symanticVersionToNumeric(symantic) {
        if (!symantic) return null;
        if (symantic[0] == "v") symantic = symantic.substring(1);
        var parts = symantic.split(".");
        var step = 1000;
        var numeric = parseInt(parts[0])*step*step + parseInt(parts[1])*step + parseInt(parts[2]);
        return numeric;
    }
}

var updateManager = new UpdateManager();
export default updateManager;


