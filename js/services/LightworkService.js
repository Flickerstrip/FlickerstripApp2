var EventEmitter = require("events").EventEmitter;

var _ = require("lodash");
var b64 = require("base64-js");

import SettingsManager from "~/stores/SettingsManager";
import Pattern from "~/models/Pattern";
import Configuration from "~/constants/Configuration";
import UserService from "~/services/UserService";

var debugRequests = true;

function fetchJson(url,opt) {
    var start = new Date().getTime();
    return fetch(url,opt).catch(() => console.log("CAUGHT ERROR")).then(function(response) {
        var end = new Date().getTime();
        var delta = end - start;
        if (debugRequests) console.log("["+delta+" ms] Fetched "+url);
        return response.json();
    });
}

class LightworkService extends EventEmitter {
    static fetchUserLightworks(userId,cb) {
        var opt = {
            method: "GET",
        };

        opt.headers = {};
        if (SettingsManager.getUser()) opt.headers["Authorization"] = UserService.getAuthorizationHeader(SettingsManager.getUser());
         
        fetchJson(Configuration.LIGHTWORK_ENDPOINT+"/user/"+userId+"/patterns",opt).catch(() => cb(null)).then(function(data) {
            cb(data);
        }); 
    }
    static fetchPublicLightworks(page,cb) {
        page = page || 0;

        var opt = {
            method: "GET",
        };

        opt.headers = {};
        if (SettingsManager.getUser()) opt.headers["Authorization"] = UserService.getAuthorizationHeader(SettingsManager.getUser());
         
        fetchJson(Configuration.LIGHTWORK_ENDPOINT+"/pattern?size=20&page="+page,opt).then(function(data) {
            cb(data);
        }); 
    }
    static fetchLightworkData(id,cb) {
        if (Array.isArray(id)) return this.fetchLightworkDataMultiple(id,cb); //we have multiple ids now, use the correct method

        var opt = {
            method: "GET",
        };

        opt.headers = {};
        if (SettingsManager.getUser()) opt.headers["Authorization"] = UserService.getAuthorizationHeader(SettingsManager.getUser());
         
        fetchJson(Configuration.LIGHTWORK_ENDPOINT+"/pattern/"+id,opt).then(function(data) {
            cb(data);
        }); 
    }
    static fetchLightworkDataMultiple(ids,cb) {
        var opt = {
            method: "GET",
        };

        opt.headers = {};
        if (SettingsManager.getUser()) opt.headers["Authorization"] = UserService.getAuthorizationHeader(SettingsManager.getUser());
         
        fetchJson(Configuration.LIGHTWORK_ENDPOINT+"/pattern/loadPatternData?ids="+ids.join(","),opt).then(function(data) {
            cb(data);
        }); 
    }
    static saveLightwork(id,lw,cb) {
        var opt = {
            method: "POST",
        };

        opt.headers = {};
        if (SettingsManager.getUser()) {
            opt.headers["Authorization"] = UserService.getAuthorizationHeader(SettingsManager.getUser());
        } else {
            throw("Unauthorized");
        }

        opt.headers["Content-Type"] = "application/json";

        //TODO fix this, we should make the pattern object used throughout
        var p = new Pattern();
        _.extend(p,lw);
        opt.body=p.serializeToJSON();

        if (id == null) {
            fetchJson(Configuration.LIGHTWORK_ENDPOINT+"/pattern/create",opt).then(function(data) {
                if (cb) cb(data);
            }); 
        } else {
            fetchJson(Configuration.LIGHTWORK_ENDPOINT+"/pattern/"+id+"/update",opt).then(function(data) {
                if (cb) cb(data);
            }); 
        }
    }
    static deleteLightwork(id,cb) {
        var opt = {
            method: "POST",
        };

        opt.headers = {};
        if (SettingsManager.getUser()) {
            opt.headers["Authorization"] = UserService.getAuthorizationHeader(SettingsManager.getUser());
        } else {
            throw("Unauthorized");
        }

        fetchJson(Configuration.LIGHTWORK_ENDPOINT+"/pattern/"+id+"/delete",opt).then(function() {
            if (cb) cb();
        }); 
    }
}

export default LightworkService;

