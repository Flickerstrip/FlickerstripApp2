var EventEmitter = require("events").EventEmitter;

var _ = require("lodash");
var b64 = require("base64-js");

import SettingsManager from "~/stores/SettingsManager";
import Pattern from "~/models/Pattern";
import Configuration from "~/constants/Configuration";
import UserService from "~/services/UserService";

class LightworkService extends EventEmitter {
    static fetchUserLightworks(userId,page,cb) {
        page = page || 0;

        var opt = {
            method: "GET",
        };

        opt.headers = {};
        if (SettingsManager.getUser()) opt.headers["Authorization"] = UserService.getAuthorizationHeader(SettingsManager.getUser());
         
         fetch(Configuration.LIGHTWORK_ENDPOINT+"/user/"+userId+"/patterns?size=20&page="+page,opt).then((response) => response.json()).then(function(data) {
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
         
         fetch(Configuration.LIGHTWORK_ENDPOINT+"/pattern?size=20&page="+page,opt).then((response) => response.json()).then(function(data) {
             cb(data);
         }); 
    }
    static fetchLightworkData(id,cb) {
        var opt = {
            method: "GET",
        };

        opt.headers = {};
        if (SettingsManager.getUser()) opt.headers["Authorization"] = UserService.getAuthorizationHeader(SettingsManager.getUser());
         
         fetch(Configuration.LIGHTWORK_ENDPOINT+"/pattern/"+id,opt).then((response) => response.json()).then(function(data) {
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

        console.log("saving lightwork",id,lw,opt);
        //TODO fix this, we should make the pattern object used throughout
        var p = new Pattern();
        _.extend(p,lw);
        opt.body=p.serializeToJSON();

        fetch(Configuration.LIGHTWORK_ENDPOINT+"/pattern/"+id+"/update",opt).then((response) => response.json()).then(function(data) {
            cb(data);
        }); 
    }
}

export default LightworkService;

