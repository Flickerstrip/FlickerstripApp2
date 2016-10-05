var EventEmitter = require("events").EventEmitter;
var _ = require("lodash");

import ActionTypes from "~/constants/ActionTypes.js";
import FlickerstripDispatcher from "~/dispatcher/FlickerstripDispatcher.js";
import LightworkService from "~/services/LightworkService.js";

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
            }
        }.bind(this));

        this.lightworksById = {};
        this.userLightworks = {};
        this.publicLightworks = null;
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
    saveLightwork(lightworkId,lw) {
        LightworkService.saveLightwork(lightworkId,lw,function(data) {
            console.log("saved lightwork, response",data);
        });
    }
    hasCachedUserLightworks(userId,page) {
        if (!this.userLightworks[userId]) return false;

        var pagesTotal = Math.ceil(this.userLightworks[userId].totalLightworks / pageSize);
        var pagesLoaded = Math.ceil(this.userLightworks[userId].lightworks.length / pageSize);

        if (page > pagesLoaded) return false;

        return true;
    }
    getUserLightworks(userId,page,cb) {
        if (this.hasCachedUserLightworks(userId,page)) {
            var lightworks = _.chunk(this.userLightworks[userId].lightworks,pageSize)[page].map(function(lightworkId) {
                return this.getLightwork(lightworkId);
            }.bind(this));

            return cb(lightworks);
        }

        var pagesLoaded = !this.userLightworks[userId] ? 0 : Math.ceil(this.userLightworks[userId].lightworks.length / pageSize);
        if (page != pagesLoaded) return console.log("ERROR: tried to load user lightwork pages out of order..!");

        LightworkService.fetchUserLightworks(userId,this.page,function(result) { //TODO this currently doesnt paginate.. but it should
            this.userLightworks[userId] = {
                totalLightworks: result.length,
                lightworks: [],
            }
            _.each(result,function(lw) {
                this.lightworksById[lw.id] = lw;
                this.userLightworks[userId].lightworks.push(lw.id);
            }.bind(this));

            this.getUserLightworks(userId,page,cb); //should be safe to call the original function now that we've filled the cache
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

