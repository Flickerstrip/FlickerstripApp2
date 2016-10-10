var EventEmitter = require("events").EventEmitter;
var _ = require("lodash");

import ActionTypes from "~/constants/ActionTypes.js";
import FlickerstripDispatcher from "~/dispatcher/FlickerstripDispatcher.js";
import LightworkService from "~/services/LightworkService.js";
import SettingsManager from "~/stores/SettingsManager.js";

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

        this.lightworksById = {};
        this.userLightworks = {};
        this.publicLightworks = null;
    }
    lightworkDeleted(lightworkId) {
        delete this.lightworksById[lightworkId];

        var index = _.findIndex(this.publicLightworks,lightworkId);
        if (index != -1) {
            this.publicLightworks.slice(index,1);
            this.emit("PublicLightworkListUpdated");
        }

        _.each(this.userLightworks,function(info,userId) {
            var index = _.indexOf(info.lightworks,lightworkId);
            if (index == -1) return;
            this.userLightworks[userId].lightworks.splice(index,1);
            this.emit("UserLightworkListUpdated",userId);
        }.bind(this));
        this.emit("LightworkListUpdated"); //TODO do we need this? this is internal state, we dont necessarily need to let anyone knwo..
    }
    getLightworkData(id,cb) {
        var lw = this.getLightwork(id);
        if (lw.pixelData) {
            cb(lw);
        } else {
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
    saveLightwork(lightworkId,lw,cb) {
        LightworkService.saveLightwork(lightworkId,lw,function(data) {
            if (lightworkId == null) { //new lightwork created
                data.pixelData = lw.pixelData;
                data.selected = false;
                this.lightworksById[data.id] = data;
                if (this.userLightworks[SettingsManager.getUser().id]) this.userLightworks[SettingsManager.getUser().id].lightworks.push(data.id);
                if (cb) cb(data.id,data);
                this.emit("UserLightworkListUpdated",SettingsManager.getUser().id);
            } else {
                _.extend(this.lightworksById[lightworkId],lw);
                this.emit("LightworkUpdated",lightworkId);
            }
        }.bind(this));
    }
    hasCachedUserLightworks(userId) {
        if (!this.userLightworks[userId]) return false;

        return true;
    }
    getUserLightworks(userId,cb) {
        if (this.hasCachedUserLightworks(userId)) {
            var lightworks = this.userLightworks[userId].lightworks.map(function(lightworkId) {
                return this.getLightwork(lightworkId);
            }.bind(this));

            return cb(lightworks);
        }

        LightworkService.fetchUserLightworks(userId,function(result) { //TODO this currently doesnt paginate.. but it should
            this.userLightworks[userId] = {
                totalLightworks: result.length,
                lightworks: [],
            }
            _.each(result,function(lw) {
                this.lightworksById[lw.id] = lw;
                this.userLightworks[userId].lightworks.push(lw.id);
            }.bind(this));

            this.getUserLightworks(userId,cb); //should be safe to call the original function now that we've filled the cache
        }.bind(this));
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

