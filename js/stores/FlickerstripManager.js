var EventEmitter = require("events").EventEmitter;
var _ = require("lodash");

import DiscoveryService from "~/services/DiscoveryService.js";
import ActionTypes from "~/constants/ActionTypes.js";
import LEDStrip from "~/models/LEDStrip.js";
import FlickerstripDispatcher from "~/dispatcher/FlickerstripDispatcher.js";
import LightworkManager from "~/stores/LightworkManager";

class FlickerstripManager extends EventEmitter {
    constructor(props) {
        super(props);

        this.discover = new DiscoveryService();

        this.listeners = [];

        this.discover.on("Found",this.onStripDiscovered.bind(this));
        this.discover.on("Lost",this.onStripLost.bind(this));

        FlickerstripDispatcher.register(function(e) {
            if (e.type === ActionTypes.SELECT_STRIP) {
                this.getStrip(e.stripId).selected = true;
                this.emit("StripUpdated",e.stripId);
            } else if (e.type === ActionTypes.DESELECT_STRIP) {
                this.getStrip(e.stripId).selected = false;
                this.emit("StripUpdated",e.stripId);
            } else if (e.type === ActionTypes.TOGGLE_POWER) {
                var strip = this.getStrip(e.stripId);
                strip.toggle(e.power === undefined ? !strip.power : e.power); //set the power based on the "power" parameter or toggle if parameter isnt provided
                this.emit("StripUpdated",e.stripId);
            } else if (e.type === ActionTypes.LOAD_PATTERN) {
                var strip = this.getStrip(e.stripId);
                strip.loadPattern(e.pattern,false);
            } else if (e.type === ActionTypes.LOAD_PREVIEW) {
                var strip = this.getStrip(e.stripId);
                strip.loadPattern(e.pattern,true);
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
    getSelectedCount() {
        return _.filter(this.strips,(strip) => {return strip.selected}).length;
    }
    getSelectedFlickerstrips() {
        return _.filter(this.strips,(strip) => {return strip.selected});
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
                this.emit("StripAdded",strip);
                strip.on("StripDisconnected",this.onStripDisconnected.bind(this));
                strip.on("StripUpdated",this.stripUpdateReceived.bind(this));
            }
        }.bind(this));
    }
    onStripDisconnected(id) {
        var strip = this.strips[id];
        if (!strip) return;
        console.log("removing strip",id);
        delete this.strips[id];
        this.emit("StripRemoved",id);
    }
    onStripLost(ip) {
        var id = this.findStripIdByIp(ip);
        if (id == null) return;
        var strip = this.strips[id];
        if (!strip) return;
        console.log("removing strip",id);
        delete this.strips[id];

        this.emit("StripRemoved",id);
    }
}

var flickerstripManager = new FlickerstripManager();
export default flickerstripManager;
