var EventEmitter = require("events").EventEmitter;
var _ = require("lodash");

var Pattern = require("~/models/Pattern.js");

import ActionTypes from "~/constants/ActionTypes.js";
import FlickerstripDispatcher from "~/dispatcher/FlickerstripDispatcher.js";
import LightworkService from "~/services/LightworkService.js";
import SettingsManager from "~/stores/SettingsManager.js";
import NetworkManager from "~/stores/NetworkManager.js";
import EditorManager from "~/stores/EditorManager.js";
import TaskManager from "~/stores/TaskManager";

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
                this.deleteLightwork(e.lightworkId);
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
            } else if (e.type === ActionTypes.CONFIGURE_LIGHTWORK) {
                if (!this.lightworkConfiguration[e.lightworkId]) this.lightworkConfiguration[e.lightworkId] = {};
                this.lightworkConfiguration[e.lightworkId] = _.extend(this.lightworkConfiguration[e.lightworkId],e.configuration);
                this.persistLightworks();
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
        this.lightworkConfiguration = {};
    }
    getConfiguration(id) {
        if (this.lightworkConfiguration[id]) return this.lightworkConfiguration[id];
        return null;
    }
    settingsLoaded() {
        if (SettingsManager.storedLightworksById) {
            this.lightworksById = SettingsManager.storedLightworksById;
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

        if (SettingsManager.publicLightworks) {
            this.publicLightworks = SettingsManager.publicLightworks;
        }

        if (SettingsManager.lightworkConfiguration) {
            this.lightworkConfiguration = SettingsManager.lightworkConfiguration;
        }
    }
    lightworkDeleted(lightworkId,silent) {
        delete this.lightworksById[lightworkId];

        var index = _.findIndex(this.publicLightworks,lightworkId);
        if (index != -1) {
            this.publicLightworks.slice(index,1);
            if (!silent) this.emit("PublicLightworkListUpdated");
        }

        this.queuedActions = _.filter(this.queuedActions,function(action) {
            if (action.lightwork) return action.lightwork.id !== lightworkId;
            return true;
        });

        _.each(this.userLightworks,function(info,userId) {
            var index = _.indexOf(info.lightworks,lightworkId);
            if (index == -1) return;
            this.userLightworks[userId].lightworks.splice(index,1);
            if (!silent) this.emit("UserLightworkListUpdated",userId);
        }.bind(this));
        if (!silent) this.emit("LightworkListUpdated"); //TODO do we need this? this is internal state, we dont necessarily need to let anyone know..
    }
    transformLightwork(lw,configuration) {
        //console.log("transforming lightwork",lw.id,configuration);
        var xformed = _.extend({},lw);
        if (configuration.brightness === undefined) configuration.brightness = 100;
        if (configuration.speed === undefined) configuration.speed = 1;

        var brightnessMultiplier = configuration.brightness / 100.0;
        xformed.fps = Math.round(xformed.fps * configuration.speed);

        if (xformed.fps < 0) {
            xformed.fps = -xformed.fps;
            //flip the array..

            xformed.pixelData = new Uint8Array(lw.pixelData.length);
            //console.log("pix: ",lw.pixels,"frames: ",lw.frames);
            for (var i=0; i<xformed.pixels * xformed.frames; i++) {
                var oframe = Math.floor(i / xformed.pixels);
                var pix = i % xformed.pixels;
                var nframe = xformed.frames - oframe;
                var ni = nframe * xformed.pixels + pix;
                //console.log(i,oframe,pix,nframe,ni);
                xformed.pixelData[3*i] = Math.round(lw.pixelData[3*ni] * brightnessMultiplier);
                xformed.pixelData[3*i+1] = Math.round(lw.pixelData[3*ni+1] * brightnessMultiplier);
                xformed.pixelData[3*i+2] = Math.round(lw.pixelData[3*ni+2] * brightnessMultiplier);
            }
        } else {
            xformed.pixelData = new Uint8Array(xformed.pixelData);
            for (var i=0; i<xformed.pixelData.length; i++) {
                xformed.pixelData[i] = Math.round(xformed.pixelData[i] * brightnessMultiplier);
            }
        }

        return xformed;
    }
    getLightworkData(id,cb,noTransform) {
        var lw = this.getLightwork(id);
        if (!lw) lw = EditorManager.getLightwork(id);
        if (!lw) return cb(null);

        if (lw.pixelData) {
            if (!noTransform && this.lightworkConfiguration[id] !== undefined) lw = this.transformLightwork(lw,this.lightworkConfiguration[id]);
            cb(lw);
        } else {
            if (!NetworkManager.hasInternet()) return cb(null);
            LightworkService.fetchLightworkData(lw.id,function(lwdata) {
                _.extend(lw,lwdata);
                lw.pixelData = b64.toByteArray(lw.pixelData);
                if (!noTransform && this.lightworkConfiguration[id] !== undefined) lw = this.transformLightwork(lw,this.lightworkConfiguration[id]);
                cb(lw);
            }.bind(this));
        }
    }
    createLightworkId() {
        var id = null;
        while(!id || _.find(this.lightworks,{id:id})) {
            id = "tmp_"+Math.ceil(Math.random()*100000);
        }
        return id;
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
        var publicLightworks = this.publicLightworks;
        //console.log("public lightworks",publicLightworks);
        var userLightworks = this.userLightworks[SettingsManager.getUserId()] ? this.userLightworks[SettingsManager.getUserId()] : null;
        //console.log("lwbyid: ",_.keys(this.lightworksById).join(","));
        var lightworksById = _.pickBy(this.lightworksById,function(value,key) {
            var key = key.indexOf("tmp_") === 0 ? key : parseInt(key);
            if (userLightworks && _.includes(userLightworks.lightworks,key)) return true;
            if (publicLightworks && _.includes(publicLightworks.lightworks,key)) return true;
            return false;
        });
        lightworksById = _.cloneDeep(lightworksById);
        //console.log("persisting lightworks: ",_.map(lightworksById,"id").join(","));

        _.each(lightworksById,function(value,key) {
            if (!value.pixelData) return;
            lightworksById[key].pixelData = Pattern.objectToPlainArray(value.pixelData);
        });

        //console.log("queue",this.queuedActions.length,_.each(_.cloneDeep(this.queuedActions),(item) => item.lightwork ? delete item.lightwork["pixelData"] : null));

        SettingsManager.storeLightworks(userLightworks,lightworksById,this.queuedActions,this.publicLightworks,this.lightworkConfiguration);
    }
    nextQueue() {
        console.log("next called");
        if (this.taskId) this.taskId = TaskManager.updateProgress(this.taskId,true,null,true) ? null : this.taskId;
        this.busy = false;
        if (this.actionCallback) this.actionCallback.apply(null,arguments); //TODO gross, dont use a instance var 
        this.persistLightworks();
        this.handleQueue();
    }
    handleQueue() {
        if (!SettingsManager.isUserValid() || !NetworkManager.hasInternet() || this.busy || !this.queuedActions.length) return;

        if (!this.taskId) {
            this.taskId = TaskManager.start(1,"network",{ name:"Syncing", totalSteps:this.queuedActions.length });
        }

        var nextAction = this.queuedActions.pop();
        this.actionCallback = nextAction.callback;

        this.busy = true;
        if (nextAction.type == "save") {
            this.saveLightworkImpl(nextAction.lightworkId,nextAction.lightwork,this.nextQueue.bind(this));
        } else if (nextAction.type == "delete") {
            LightworkService.deleteLightwork(nextAction.lightworkId,this.nextQueue.bind(this));
        }
    }
    deleteLightwork(lightworkId,cb) {
        var isPersisted = typeof lightworkId != "string" || lightworkId.indexOf("tmp_") == -1;

        this.lightworkDeleted(lightworkId);

        if (isPersisted) {
            this.queuedActions.push({
                type:"delete",
                lightworkId: lightworkId,
                callback: cb,
            });
        }

        this.persistLightworks();

        this.handleQueue();

        if (!isPersisted && cb) cb();
    }
    saveLightwork(lightworkId,lw,cb) {
        if (lightworkId == null) { //we'll put a pending lightwork in here
            var userId = SettingsManager.getUserId();
            var tempId = lw.id ? lw.id : this.createLightworkId();
            lw.id = tempId;
            lw.pending = true;
            if (!this.userLightworks[userId]) this.userLightworks[userId] = {lightworks: [], lastRefresh: null};
            if (lw.id) this.lightworkDeleted(lw.id,true); //delete any temporary ids that we have kicking around
            this.userLightworks[userId].lightworks.push(tempId);
            this.lightworksById[tempId] = lw;
            this.emit("UserLightworkListUpdated",userId);
        } else {
            _.extend(this.lightworksById[lightworkId],lw);
            this.emit("LightworkUpdated",lightworkId);
        }
        this.queuedActions.push({
            type:"save",
            lightwork: lw,
            lightworkId: lightworkId,
            callback: cb,
        });
        this.persistLightworks();
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
                if (cb) cb(data.id,data);
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
            var lightworks = this.userLightworks[userId].lightworks.map((lightworkId) => this.getLightwork(lightworkId));

            return cb(lightworks);
        } else {
            cb(null);
        }
    }
    loadMissingUserLightworkData(cb) {
        if (!NetworkManager.hasInternet() || !SettingsManager.isUserValid()) return;

        var userId = SettingsManager.getUserId()
        var userLightworks = this.userLightworks[userId].lightworks.map((lightworkId) => this.getLightwork(lightworkId));
        var missingIds = _.map(_.reject(userLightworks,"pixelData"),"id");
        if (missingIds.length == 0) return;
        this.downloadLightworks(missingIds);
    }
    loadMissingRepostiroyLightworks(cb) {
        if (!NetworkManager.hasInternet() || !SettingsManager.isUserValid()) return;

        var publicLightworks = this.publicLightworks.lightworks.map((lightworkId) => this.getLightwork(lightworkId));
        var missingIds = _.map(_.reject(publicLightworks,"pixelData"),"id");
        if (missingIds.length == 0) return;
        this.downloadLightworks(missingIds);
    }
    downloadLightworks(ids) {
        LightworkService.fetchLightworkData(ids,function(lightworks) {
            _.each(lightworks,function(lwdata,id) {
                var lw = this.lightworksById[lwdata.id];
                _.extend(lw,lwdata);
                lw.pixelData = b64.toByteArray(lw.pixelData);
            }.bind(this));

            this.persistLightworks();
        }.bind(this));
    }
    getUserLightworks(userId,cb) {
        if (NetworkManager.hasInternet() && this.userLightworkCacheStale(userId)) {
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

                this.loadMissingUserLightworkData();
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
        //console.log("page",page);
        if (this.hasCachedPublicLightworks(page)) {
            //console.log("before",this.publicLightworks.lightworks.join(", "));
            var lightworks = _.chunk(this.publicLightworks.lightworks,pageSize)[page].map(function(lightworkId) {
                return this.getLightwork(lightworkId);
            }.bind(this));
            //console.log("lw by id",_.map(this.lightworksById,"id").join(", "));
            //console.log("afterm",_.map(lightworks,"id").join(", "));

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

            this.persistLightworks();
            this.loadMissingRepostiroyLightworks();

            this.getPublicLightworks(page,cb);
        }.bind(this));
    }
}

var lightworkManager = new LightworkManager();
export default lightworkManager;

