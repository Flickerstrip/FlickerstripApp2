var EventEmitter = require("events").EventEmitter;
var _ = require("lodash");

import ActionTypes from "~/constants/ActionTypes.js";
import FlickerstripDispatcher from "~/dispatcher/FlickerstripDispatcher.js";
import LightworkService from "~/services/LightworkService.js";
import SettingsManager from "~/stores/SettingsManager.js";
import NetworkManager from "~/stores/NetworkManager.js";
import EditorManager from "~/stores/EditorManager.js";

var pageSize = 20;
var b64 = require("base64-js");

class LightworkManager extends EventEmitter {
    constructor(props) {
        super(props);
        this.setMaxListeners(100);

        FlickerstripDispatcher.register(function(e) {
            if (e.type === ActionTypes.SELECT_LIGHTWORK) {
                this.getLightwork(e.lightworkId).selected = true;
                this.emit("LightworkUpdated",e.lightworkId);
            } else if (e.type === ActionTypes.DESELECT_LIGHTWORK) {
                this.getLightwork(e.lightworkId).selected = false;
                this.emit("LightworkUpdated",e.lightworkId);
            } else if (e.type === ActionTypes.LOAD_LIGHTWORK) {
                this.getLightworkData(e.lightworkId);
            } else if (e.type === ActionTypes.PUBLISH_LIGHTWORK) {
                this.saveLightwork(e.lightworkId,{"published":e.state});
            } else if (e.type === ActionTypes.EDIT_LIGHTWORK) {
                this.saveLightwork(e.lightworkId,e.props);
            } else if (e.type === ActionTypes.STAR_LIGHTWORK) {
                //Implement starring.. xD should this be on the network? probably
            } else if (e.type === ActionTypes.DELETE_LIGHTWORK) {
                LightworkService.deleteLightwork(e.lightworkId,function() {
                    this.lightworkDeleted(e.lightworkId);
                    this.persistLightworks();
                }.bind(this));
            } else if (e.type === ActionTypes.DUPLICATE_LIGHTWORK) {
                var lightwork = this.getLightwork(e.lightworkId);

                this.getLightworkData(e.lightworkId,function(lw) {
                    var duplicate = _.cloneDeep(lw);
                    duplicate.name = e.name;
                    duplicate.published = false;
                    duplicate.id = null;
                    delete duplicate.owner;

                    this.saveLightwork(null,duplicate);
                }.bind(this));
            }
        }.bind(this));

        NetworkManager.on("ConnectionStatus",this.handleQueue.bind(this));
        SettingsManager.on("UserUpdated",this.handleQueue.bind(this));
        SettingsManager.on("SettingsLoaded",this.settingsLoaded.bind(this));

        this.selectedIds = {};
        this.queuedActions = [];
        this.busy = false;
        this.lightworksById = {};
        this.userLightworks = {};
        this.publicLightworks = null;
    }
    settingsLoaded() {
        if (SettingsManager.storedLightworksById) {
            this.lightworksById = SettingsManager.storedLightworksById;
            console.log("Loaded lightwork data: "+_.map(this.lightworksById,"id").join(", "));
            this.emit("LightworkListUpdated");
        }
        if (SettingsManager.userLightworks) {
            this.userLightworks[SettingsManager.getUserId()] = SettingsManager.userLightworks;
            this.emit("UserLightworkListUpdated",SettingsManager.getUserId());
        }

        if (SettingsManager.queuedActions) {
            this.queuedActions = SettingsManager.queuedActions;
            this.handleQueue();
        }
    }
    lightworkDeleted(lightworkId,silent) {
        delete this.lightworksById[lightworkId];

        var index = _.findIndex(this.publicLightworks,lightworkId);
        if (index != -1) {
            this.publicLightworks.slice(index,1);
            if (!silent) this.emit("PublicLightworkListUpdated");
        }

        _.each(this.userLightworks,function(info,userId) {
            var index = _.indexOf(info.lightworks,lightworkId);
            if (index == -1) return;
            this.userLightworks[userId].lightworks.splice(index,1);
            if (!silent) this.emit("UserLightworkListUpdated",userId);
        }.bind(this));
        if (!silent) this.emit("LightworkListUpdated"); //TODO do we need this? this is internal state, we dont necessarily need to let anyone know..
    }
    getLightworkData(id,cb) {
        var lw = this.getLightwork(id);
        if (!lw) lw = EditorManager.getLightwork(id);
        if (!lw) return cb(null);

        if (lw.pixelData) {
            cb(lw);
        } else {
            if (!NetworkManager.isConnected()) return cb(null);
            LightworkService.fetchLightworkData(lw.id,function(lwdata) {
                _.extend(lw,lwdata);
                lw.pixelData = b64.toByteArray(lw.pixelData);
                cb(lw);
            }.bind(this));
        }
    }
    getLightwork(id) {
        return this.lightworksById[id];
    }
    getSelectedCount() {
        return _.filter(_.values(this.lightworksById),(lightwork) => {return lightwork.selected}).length;
    }
    getSelectedLightworks() {
        return _.filter(_.values(this.lightworksById),(lightwork) => {return lightwork.selected});
    }
    persistLightworks() {
        var userLightworks = this.userLightworks[SettingsManager.getUserId()] ? this.userLightworks[SettingsManager.getUserId()] : null;
        var lightworksById = _.pickBy(this.lightworksById,function(value,key) {
            var key = key.indexOf("tmp_") === 0 ? key : parseInt(key);
            return userLightworks == null ? false : _.includes(userLightworks.lightworks,key);
        });

        SettingsManager.storeLightworks(userLightworks,lightworksById,this.queuedActions);
    }
    handleQueue() {
        if (!SettingsManager.isUserValid() || !NetworkManager.isConnected() || this.busy || !this.queuedActions.length) return;

        this.busy = true;
        var nextAction = this.queuedActions.pop();
        if (nextAction.type == "save") {
            this.saveLightworkImpl(nextAction.lightworkId,nextAction.lightwork,function() {
                console.log("save complete!");
                this.busy = false;
                if (nextAction.callback) nextAction.callback.apply(null,arguments);
                this.handleQueue();
            }.bind(this));
        }
    }
    saveLightwork(lightworkId,lw,cb) {
        this.queuedActions.push({
            type:"save",
            lightwork: lw,
            lightworkId: lightworkId,
            callback: cb,
        });
        if (lightworkId == null) { //we'll put a pending lightwork in here
            var userId = SettingsManager.getUserId();
            var tempId = lw.id;
            lw.pending = true;
            if (!this.userLightworks[userId]) this.userLightworks[userId] = {lightworks: [], lastRefresh: null};
            this.lightworkDeleted(lw.id,true); //delete any temporary ids that we have kicking around
            this.userLightworks[userId].lightworks.push(tempId);
            this.lightworksById[tempId] = lw;
            this.persistLightworks();
            this.emit("UserLightworkListUpdated",userId);
        }
        this.handleQueue();

    }
    saveLightworkImpl(lightworkId,lw,cb) {
        LightworkService.saveLightwork(lightworkId,lw,function(data) {
            if (lightworkId == null) { //new lightwork created
                data.pixelData = lw.pixelData;
                data.selected = false;
                this.lightworkDeleted(lw.id,true); //delete any temporary ids that we have kicking around
                this.lightworksById[data.id] = data;
                if (this.userLightworks[SettingsManager.getUser().id]) this.userLightworks[SettingsManager.getUser().id].lightworks.push(data.id);
                if (cb) cb(data.id,data);
                this.persistLightworks();
                this.emit("UserLightworkListUpdated",SettingsManager.getUser().id);
            } else {
                _.extend(this.lightworksById[lightworkId],lw);
                this.persistLightworks();
                this.emit("LightworkUpdated",lightworkId);
            }
        }.bind(this));
    }
    userLightworkCacheStale(userId) {
        var CACHE_LONGEVITY = 10 * 60 * 1000; //10 minutes

        if (!this.userLightworks[userId]) return true;

        var lastRefresh = this.userLightworks[userId].lastRefresh;
        if (!lastRefresh) return true;

        if (new Date().getTime() - lastRefresh > CACHE_LONGEVITY) return true;

        return false;
    }
    getUserLightworksCached(userId,cb) {
        if (this.userLightworks[userId]) {
            var lightworks = this.userLightworks[userId].lightworks.map(function(lightworkId) {
                return this.getLightwork(lightworkId);
            }.bind(this));

            return cb(lightworks);
        } else {
            cb(null);
        }
    }
    getUserLightworks(userId,cb) {
        if (NetworkManager.isConnected() && this.userLightworkCacheStale(userId)) {
            LightworkService.fetchUserLightworks(userId,function(result) {
                if (!this.userLightworks[userId]) this.userLightworks[userId] = {lightworks: [], lastRefresh: null}

                this.userLightworks[userId].lastRefresh = new Date().getTime();

                _.each(result,function(lw) {
                    this.lightworksById[lw.id] = lw;
                    this.userLightworks[userId].lightworks.push(lw.id);
                }.bind(this));

                this.userLightworks[userId].lightworks = _.uniq(this.userLightworks[userId].lightworks);

                this.persistLightworks();
                this.getUserLightworksCached(userId,cb);
            }.bind(this));
        } else {
            this.getUserLightworksCached(userId,cb);
        }

    }
    hasCachedPublicLightworks(page) {
        if (!this.publicLightworks) return false;

        var pagesTotal = Math.ceil(this.publicLightworks.totalLightworks / pageSize);
        var pagesLoaded = Math.ceil(this.publicLightworks.lightworks.length / pageSize);

        if (page >= pagesLoaded) return false;

        return true;
    }
    getPublicLightworks(page,cb) { //DRY this up a bit (with user lightworks)
        if (this.hasCachedPublicLightworks(page)) {
            var lightworks = _.chunk(this.publicLightworks.lightworks,pageSize)[page].map(function(lightworkId) {
                return this.getLightwork(lightworkId);
            }.bind(this));

            return cb(Math.ceil(this.publicLightworks.totalLightworks / pageSize),lightworks);
        }

        var pagesLoaded = !this.publicLightworks ? 0 : Math.ceil(this.publicLightworks.lightworks.length / pageSize);
        if (page != pagesLoaded) return console.log("ERROR: tried to load public lightwork pages out of order..!"); //TODO automatically load intervening pages

        LightworkService.fetchPublicLightworks(page,function(result) {
            if (!this.publicLightworks) this.publicLightworks = {totalLightworks:result.total,lightworks:[]};

            _.each(result.results,function(lw) {
                this.lightworksById[lw.id] = lw;
                this.publicLightworks.lightworks.push(lw.id);
            }.bind(this));

            this.getPublicLightworks(page,cb);
        }.bind(this));
    }
}

var lightworkManager = new LightworkManager();
export default lightworkManager;

