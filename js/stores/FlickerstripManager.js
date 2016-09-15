var EventEmitter = require("events").EventEmitter;
var _ = require("lodash");

import DiscoveryService from "~/services/DiscoveryService.js";
import ActionTypes from "~/constants/ActionTypes.js";
import LEDStrip from "~/models/LEDStrip.js";
import FlickerstripDispatcher from "~/dispatcher/FlickerstripDispatcher.js";

class FlickerstripManager extends EventEmitter {
    constructor(props) {
        super(props);

        this.discover = new DiscoveryService();

        this.discover.on("Found",this.onStripDiscovered.bind(this));
        this.discover.on("Lost",this.onStripLost.bind(this));

        FlickerstripDispatcher.register(function(e) {
                if (e.type === ActionTypes.SELECT_STRIP) {
                        console.log("strip selected!");
                        this.getStrip(e.stripId).selected = true;
                        this.emit("StripUpdated",e.stripId);
                } else if (e.type === ActionTypes.DESELECT_STRIP) {
                        console.log("strip deselected!");
                        this.getStrip(e.stripId).selected = false;
                        this.emit("StripUpdated",e.stripId);
                } else if (e.type === ActionTypes.TOGGLE_POWER) {
                        console.log("toggling power");
                        var strip = this.getStrip(e.stripId);
                        strip.toggle(e.power === undefined ? !strip.power : e.power); //set the power based on the "power" parameter or toggle if parameter isnt provided
                        this.emit("StripUpdated",e.stripId);
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
    onStripDiscovered(ip) {
        LEDStrip.probeStrip(ip,function(strip) {
            if (this.strips[strip.id]) {
                //this.emit("StripConnected",strip);
            } else {
                this.strips[strip.id] = strip;
                this.emit("StripAdded",strip);
            }
        }.bind(this));
    }
    onStripLost(ip) {
        var id = this.findStripIdByIp(ip);
        var strip = this.strips[id];
        delete this.strips[id];

        this.emit("StripRemoved",strip);
    }
}

var flickerstripManager = new FlickerstripManager();
export default flickerstripManager;
