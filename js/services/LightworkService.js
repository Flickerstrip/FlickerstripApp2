var EventEmitter = require("events").EventEmitter;

var _ = require("lodash");
var b64 = require("base64-js");

import SettingsManager from "~/stores/SettingsManager";
import Pattern from "~/models/Pattern";
import Configuration from "~/constants/Configuration";
import UserService from "~/services/UserService";

var debugRequests = true;

class LightworkService extends EventEmitter {
    static fetchUserLightworks(userId,cb) {
        var opt = {
            method: "GET",
        };

        opt.headers = {};
        if (SettingsManager.getUser()) opt.headers["Authorization"] = UserService.getAuthorizationHeader(SettingsManager.getUser());
         
        if (debugRequests) console.log("FETCH: userLightworks",userId);
        fetch(Configuration.LIGHTWORK_ENDPOINT+"/user/"+userId+"/patterns",opt).catch(() => cb(null)).then((response) => response.json()).then(function(data) {
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
         
        if (debugRequests) console.log("FETCH: publicLightworks",page);
        fetch(Configuration.LIGHTWORK_ENDPOINT+"/pattern?size=20&page="+page,opt).then((response) => response.json()).then(function(data) {
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
         
        if (debugRequests) console.log("FETCH: lightworkData",id);
        fetch(Configuration.LIGHTWORK_ENDPOINT+"/pattern/"+id,opt).then((response) => response.json()).then(function(data) {
            cb(data);
        }); 
    }
    static fetchLightworkDataMultiple(ids,cb) {
        var opt = {
            method: "GET",
        };

        opt.headers = {};
        if (SettingsManager.getUser()) opt.headers["Authorization"] = UserService.getAuthorizationHeader(SettingsManager.getUser());
         
        if (debugRequests) console.log("FETCH: lightworkData (multiple)",ids.join(","));
        fetch(Configuration.LIGHTWORK_ENDPOINT+"/pattern/loadPatternData?ids="+ids.join(","),opt).then((response) => response.json()).then(function(data) {
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
            if (debugRequests) console.log("FETCH: create");
            fetch(Configuration.LIGHTWORK_ENDPOINT+"/pattern/create",opt).then((response) => response.json()).then(function(data) {
                if (cb) cb(data);
            }); 
        } else {
            if (debugRequests) console.log("FETCH: save",id);
            fetch(Configuration.LIGHTWORK_ENDPOINT+"/pattern/"+id+"/update",opt).then((response) => response.json()).then(function(data) {
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

        if (debugRequests) console.log("FETCH: delete",id);
        fetch(Configuration.LIGHTWORK_ENDPOINT+"/pattern/"+id+"/delete",opt).then().then(function() {
            if (cb) cb();
        }); 
    }
}

export default LightworkService;

