var EventEmitter = require("events").EventEmitter;
var _ = require("lodash");

import DiscoveryService from "~/services/DiscoveryService.js";
import ActionTypes from "~/constants/ActionTypes.js";
import LEDStrip from "~/models/LEDStrip.js";
import FlickerstripDispatcher from "~/dispatcher/FlickerstripDispatcher.js";
import LightworkManager from "~/stores/LightworkManager";
import SettingsManager from "~/stores/SettingsManager";
import UpdateManager from "~/stores/UpdateManager";

class FlickerstripManager extends EventEmitter {
    constructor(props) {
        super(props);

        this.discover = new DiscoveryService();

        this.listeners = [];

        this.discover.on("Found",this.onStripDiscovered.bind(this));
        //this.discover.on("Lost",this.onStripLost.bind(this));
        SettingsManager.on("SettingsLoaded",this.onSettingsLoaded.bind(this));

        /*
        setInterval(function() {
            console.log("strips: ",this.strips);
        }.bind(this),3000);
        */

        FlickerstripDispatcher.register(function(e) {
            if (e.type === ActionTypes.SELECT_STRIP) {
                this.getStrip(e.stripId).selected = true;
                this.persistStrips();
                this.emit("StripUpdated",e.stripId);
            } else if (e.type === ActionTypes.DESELECT_STRIP) {
                this.getStrip(e.stripId).selected = false;
                this.persistStrips();
                this.emit("StripUpdated",e.stripId);
            } else if (e.type === ActionTypes.TOGGLE_POWER) {
                var strip = this.getStrip(e.stripId);
                strip.toggle(e.power === undefined ? !strip.power : e.power); //set the power based on the "power" parameter or toggle if parameter isnt provided
                this.emit("StripUpdated",e.stripId);
            } else if (e.type === ActionTypes.LOAD_PATTERN) {
                var strip = this.getStrip(e.stripId);
                strip.loadPattern(e.pattern,false,e.callback);
            } else if (e.type === ActionTypes.LOAD_PREVIEW) {
                var strip = this.getStrip(e.stripId);
                strip.loadPattern(e.pattern,true,e.callback);
            } else if (e.type === ActionTypes.SELECT_PATTERN) {
                var strip = this.getStrip(e.stripId);
                strip.selectPattern(e.patternId);
            } else if (e.type === ActionTypes.DELETE_PATTERN) {
                var strip = this.getStrip(e.stripId);
                strip.forgetPattern(e.patternId);
            } else if (e.type === ActionTypes.CONFIGURE) {
                var strip = this.getStrip(e.stripId);
                _.each(e.opt,function(value,key) {
                    if (key == "name") strip.setName(value);
                    if (key == "group") strip.setGroup(value);
                    if (key == "cycle") strip.setCycle(value);
                    if (key == "length") strip.setLength(value);
                    if (key == "start") strip.setStart(value);
                    if (key == "end") strip.setEnd(value);
                    if (key == "fade") strip.setFade(value);
                    if (key == "reversed") strip.setReversed(value);
                    if (key == "brightness") strip.setBrightness(value);
                }.bind(this));
            } else if (e.type === ActionTypes.DOWNLOAD_LIGHTWORK) {
                var strip = this.getStrip(e.stripId);
                strip.downloadLightwork(e.lightworkId,function(lw) {
                    LightworkManager.saveLightwork(null,lw);
                }.bind(this));
            } else if (e.type === ActionTypes.FORGET_NETWORK) {
                var strip = this.getStrip(e.stripId);
                strip.disconnectStrip();
            } else if (e.type === ActionTypes.UPDATE_FIRMWARE) {
                var strip = this.getStrip(e.stripId);
                strip.uploadFirmware(UpdateManager.getLatestVersion());
            }
        }.bind(this));

        this.strips = {};
    }
    findStripIdByIp(ip) {
        var found = null;
        _.each(this.strips,function(value,key) {
            if (value.ip == ip) found = key;
        });
        return found;
    }
    getStrip(id) {
        return this.strips[id];
    }
    getCount() {
        return _.keys(this.strips).length;
    }
    getSelectedCount() {
        return _.filter(this.strips,(strip) => {return strip.selected}).length;
    }
    getSelectedFlickerstrips() {
        return _.filter(this.strips,(strip) => {return strip.selected});
    }
    countWhere(filter) {
        return _.filter(this.strips,filter).length;
    }
    onSettingsLoaded() {
        _.each(SettingsManager.selectedStrips,function(id) {
            if (this.strips[id]) this.strips[id].selected = true;
        }.bind(this));
    }
    persistStrips() {
        var selectedStrips = _.map(_.pickBy(this.strips,"selected"),"id");
        SettingsManager.storeStrips(selectedStrips);
    }
    getConfigurationMasterFlickerstrip() { //returns null if none
        var apStrips = _.filter(this.strips,{"ap":1});
        if (apStrips.length == 0) return null;
        return apStrips[0];
    }
    configureImpl(ip,ssid,password) {
        var opt = {
            method:"POST",
            body: "ssid="+ssid+"&password="+password,
        }
        fetch("http://"+ip+"/connect",opt);

        this.onStripLost(ip);
    }
    configureAll(ssid,password) {
        var master = this.getConfigurationMasterFlickerstrip()
        if (!master) return;

        master.getRegisteredStrips(function(registered) {
            _.each(registered,function(ip) {
                this.configureImpl(ip,ssid,password);
            }.bind(this));
            this.configureImpl(master.ip,ssid,password);
        }.bind(this));
    }
    stripUpdateReceived(id,events) {
        _.each(this.listeners,function(l) {
            if (l.id && l.id != id) return;
            if (l.events && _.intersection(l.events,events).length == 0) return;
            l.callback(id,events);
        });
    }
    addStripListener(opt,cb) {
        var opt = _.extend({},opt);
        opt.lid = new Date().getTime();
        opt.callback = cb;
        this.listeners.push(opt);
        return opt.lid;
    }
    removeStripListener(lid) {
        var index = _.findIndex(this.listeners,{lid:new Date().getTime()});
        this.listeners.splice(index,1);
    }
    onStripDiscovered(ip) {
        LEDStrip.probeStrip(ip,function(strip) {
            if (this.strips[strip.id]) {
                //this.emit("StripConnected",strip);
            } else {
                this.strips[strip.id] = strip;
                if (_.includes(SettingsManager.selectedStrips,strip.id)) strip.selected = true;
                this.emit("StripAdded",strip);
                strip.on("StripDisconnected",this.onStripDisconnected.bind(this));
                strip.on("StripUpdated",this.stripUpdateReceived.bind(this));
            }
        }.bind(this));
    }
    onStripDisconnected(id) {
        var strip = this.strips[id];
        if (!strip) return;
        console.log("removing strip (dc/err)",id);
        this.discover.markLost(strip.ip);
        delete this.strips[id];
        this.emit("StripRemoved",id);
    }
    onStripLost(ip) {
        var id = this.findStripIdByIp(ip);
        if (id == null) return;
        var strip = this.strips[id];
        if (!strip) return;
        console.log("removing strip (lost)",id);
        delete this.strips[id];

        this.discover.markLost(ip);
        this.emit("StripRemoved",id);
    }
}

var flickerstripManager = new FlickerstripManager();
export default flickerstripManager;
