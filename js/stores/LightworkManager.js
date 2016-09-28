var EventEmitter = require("events").EventEmitter;
var _ = require("lodash");

import ActionTypes from "~/constants/ActionTypes.js";
import FlickerstripDispatcher from "~/dispatcher/FlickerstripDispatcher.js";

import LightworkService from "~/services/LightworkService.js";

var pageSize = 20;

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
                var lw = this.getLightwork(e.lightworkId);
                if (lw.pixelData) {
                    e.callback(lw);
                } else {
                    LightworkService.fetchLightworkData(null,lw.id,function(lwdata) {
                        var b64 = require("base64-js");
                        console.log("loaded lw data",lwdata);
                        _.extend(lw,lwdata);
                        lw.pixelData = b64.toByteArray(lw.pixelData);
                        e.callback(lw);
                    }.bind(this));
                }
            }
        }.bind(this));

        this.lightworksById = {};
        this.userLightworks = {};
        this.publicLightworks = null;
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
    hasCachedUserLightworks(user,page) {
        if (!this.userLightworks[user.id]) return false;

        var pagesTotal = Math.ceil(this.userLightworks[user.id].totalLightworks / pageSize);
        var pagesLoaded = Math.ceil(this.userLightworks[user.id].lightworks.length / pageSize);

        if (page > pagesLoaded) return false;

        return true;
    }
    getUserLightworks(user,page,cb) {
        console.log("get user lightworks calld","u:"+user.id,page);
        if (this.hasCachedUserLightworks(user,page)) {
            var lightworks = _.chunk(this.userLightworks[user.id].lightworks,pageSize)[page].map(function(lightworkId) {
                return this.getLightwork(lightworkId);
            }.bind(this));

            return cb(lightworks);
        }

        var pagesLoaded = !this.userLightworks[user.id] ? 0 : Math.ceil(this.userLightworks[user.id].lightworks.length / pageSize);
        if (page != pagesLoaded) return console.log("ERROR: tried to load user lightwork pages out of order..!");

        LightworkService.fetchUserLightworks(user,this.page,function(result) { //TODO this currently doesnt paginate.. but it should
            this.userLightworks[user.id] = {
                totalLightworks: result.length,
                lightworks: [],
            }
            _.each(result,function(lw) {
                this.lightworksById[lw.id] = lw;
                this.userLightworks[user.id].lightworks.push(lw.id);
            }.bind(this));

            this.getUserLightworks(user,page,cb); //should be safe to call the original function now that we've filled the cache
        }.bind(this));
    }
    hasCachedPublicLightworks(page) {
        if (!this.publicLightworks) return false;

        var pagesTotal = Math.ceil(this.publicLightworks.totalLightworks / pageSize);
        var pagesLoaded = Math.ceil(this.publicLightworks.lightworks.length / pageSize);

        if (page >= pagesLoaded) return false;

        return true;
    }
    getPublicLightworks(user,page,cb) { //DRY this up a bit (with user lightworks)
        console.log("getting public lightworks",page);
        if (this.hasCachedPublicLightworks(page)) {
            var lightworks = _.chunk(this.publicLightworks.lightworks,pageSize)[page].map(function(lightworkId) {
                return this.getLightwork(lightworkId);
            }.bind(this));

            return cb(Math.ceil(this.publicLightworks.totalLightworks / pageSize),lightworks);
        }

        var pagesLoaded = !this.publicLightworks ? 0 : Math.ceil(this.publicLightworks.lightworks.length / pageSize);
        if (page != pagesLoaded) return console.log("ERROR: tried to load public lightwork pages out of order..!"); //TODO automatically load intervening pages

        LightworkService.fetchPublicLightworks(user,page,function(result) {
            if (!this.publicLightworks) this.publicLightworks = {totalLightworks:result.total,lightworks:[]};

            _.each(result.results,function(lw) {
                this.lightworksById[lw.id] = lw;
                this.publicLightworks.lightworks.push(lw.id);
            }.bind(this));

            this.getPublicLightworks(user,page,cb);
        }.bind(this));
    }
}

var lightworkManager = new LightworkManager();
export default lightworkManager;

