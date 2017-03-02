var EventEmitter = require("events").EventEmitter;
var util = require("util");
var _ = require("lodash");
//var fs = require("fs");
var Pattern = require("~/models/Pattern.js");
var b64 = require("base64-js");

import { NativeModules } from "react-native";

var RNFS = require('react-native-fs');

var PatternLoader = NativeModules.PatternLoader;

var visibleTimeout = 9000;

function param(params) {
    var query = Object.keys(params)
        .map(function(k) { return params[k] == null ? encodeURIComponent(k) : encodeURIComponent(k) + "=" + encodeURIComponent(params[k]); })
        .join("&");
    return query;
}

class LEDStrip extends EventEmitter {
    constructor(id,ip) {
        super();
        this.id = id;
        this.ip = ip;
        this._busy = false;
        this._queue = [];
        this.selected = false;
    }
    startWatchdogTimer() {
        if (this._timer) return;
        this._timer = setInterval(_.bind(function() {
            if (this._busy) return;
            if (new Date().getTime() - this._lastCommand < visibleTimeout*.3+500) return; //someone's running commands, skip the watch dog cycle
            this.requestStatus();
        },this),visibleTimeout*.3);
    }
    stopWatchdogTimer() {
        if (!this._timer) return;
        clearInterval(this._timer);
        this._timer = null;
    }
    setVisible(visible) {
        var updated = visible != this.visible;
        this.visible = visible;

        if (visible) {
            this.lastSeen = new Date().getTime()
            this.startWatchdogTimer();
        }

        if (!visible && updated) {
            this.disconnectClient();
        }
    }
    uploadFirmware(version) {
        clearInterval(this._timer); this._timer = null;
        RNFS.uploadFiles({
            toUrl: "http://"+this.ip+"/update",
            files: [{
                filepath: RNFS.DocumentDirectoryPath + "/firmware/"+version+".bin",
                filetype: "application/octet-stream",
            }],
            method: "POST",
        }).promise.then((response) => {
            if (response.statusCode == 200) {
                console.log("UPLOAD SUCCESS!"); // response.statusCode, response.headers, response.body
            } else {
                console.log("SERVER ERROR");
            }
        }).catch((err) => {
            if(err.description === "cancelled") {
                // cancelled by user
            }
            console.log(err);
        });
    }
    disconnectClient() {
        var ipAddress = this.ip;
        this.ip = null;
        this._busy = false;
        this._queue = [];
        this.stopWatchdogTimer();
        this.emit("StripDisconnected",this.id,ipAddress);
        //this.emit("Strip.StatusUpdated",{"visible":false});
    }
    receivedStatus(status,err) {
        if (err) {
            if (this.visible) this.disconnectClient();
            return;
        }
        if (!status || status["type"] != "status") status = {};
        var changedProperties = [];
        _.forOwn(status,function(value,key) {
            var change = typeof value == "object" ? JSON.stringify(this[key]) != JSON.stringify(value) : this[key] != value;
            if (change) changedProperties.push(key);
        }.bind(this));

        //if (changedProperties.length) console.log("Changed: ",changedProperties.join(","));

        _.extend(this,status);
        delete this.type;

        this.setVisible(true);
        this.status = true;
        status.visible = this.visible;
        status.ip = this.ip;
        this.emit("Strip.StatusUpdated",status);

        //Send events based on what changed
        var events = [];
        if (_.includes(changedProperties,"patterns")) events.push("patterns");
        if (_.intersection(changedProperties,["name","group","length","start","end","fade","reversed","cycle"]).length) events.push("configuration");
        if (_.intersection(changedProperties,["brightness","selectedPattern","memory"]).length) events.push("state");

        //if (events.length) console.log("emitting events: ",events.join(", "));
        if (events.length) this.emit("StripUpdated",this.id,events);
    }
    handleQueue() {
        if (!this._queue.length) return;

        var args = this._queue.shift();
        this.sendCommand.apply(this,args);
    }
    getRegisteredStrips(cb) {
        this.sendCommand("registered",cb);
    }
    sendCommand(command,cb,data,notimeout) {
        if (!this.ip) {
            console.log("ERROR: sending command to disconnected strip");
            cb(null,"DISCONNECTED");
            this.disconnectClient();
            return;
        }
        if (this._busy) {
            this._queue.push(Array.prototype.slice.call(arguments));
            return;
        }
        this._busy = true;
        this._lastCommand = new Date().getTime();
        var url = "http://"+this.ip+"/"+command;
        /*
        if (data && typeof data === "object") {
            console.log("stringifying data..");
            data = JSON.stringify(data);
        }
        */
        var opt = {};
        if (data) {
            opt.method = "POST";
            opt.body = JSON.stringify(data);
        }
        //if (!notimeout) opt.timeout = 2000; TODO reimplement timeout? Does it exist?
        //For upload status: r.req.connection.socket._bytesDispatched

        var timeoutTriggered = false;
        var timeouttimer = null;
        if (!notimeout) timeouttimer = setTimeout(function() {
            timeoutTriggered = true;
            this.disconnectClient();
            cb(null,"timeout!");
        }.bind(this),2000);

        fetch(url,opt)
            .catch(function(err) {
                if (timeoutTriggered) return;

                this.disconnectClient();
                if (err.code != "ETIMEDOUT") console.log("error!",err,command);
                if (cb) cb(null,err.code);
                clearInterval(timeouttimer);
                return;
            }.bind(this))
            .then((response) => response ? response.json() : null)
            .then(function(responseJson) {
                if (timeoutTriggered) return;
                clearInterval(timeouttimer);

                this.startWatchdogTimer();
                this._busy = false;

                if (cb) cb(responseJson);

                this.handleQueue();
            }.bind(this));
    }
    requestStatus() {
        this.sendCommand("status",this.receivedStatus.bind(this));
    }
    setName(name) {
        this.sendCommand("config/name",null,{"name":name});
        this.name = name;
        this.emit("StripUpdated",this.id,["configuration"]);
    }
    setCycle(seconds) {
        if (seconds === false) seconds = 0;
        this.sendCommand("config/cycle?value="+parseInt(seconds));
        this.cycle = seconds;
        this.emit("StripUpdated",this.id,["configuration"]);
    }
    setLength(length) {
        this.sendCommand("config/length?value="+parseInt(length));
        this.length = length;
        this.emit("StripUpdated",this.id,["configuration"]);
    }
    setStart(value) {
        if (value === false) value = 0;
        this.sendCommand("config/start?value="+parseInt(value));
        this.start = value;
        this.emit("StripUpdated",this.id,["configuration"]);
    }
    setEnd(value) {
        if (value === false) value = -1;
        this.sendCommand("config/end?value="+parseInt(value));
        this.end = value;
        this.emit("StripUpdated",this.id,["configuration"]);
    }
    setFade(value) {
        if (value === false) value = 0;
        this.sendCommand("config/fade?value="+parseInt(value));
        this.fade = value;
        this.emit("StripUpdated",this.id,["configuration"]);
    }
    setReversed(value) {
        this.sendCommand("config/reversed?value="+(value ? 1 : 0));
        this.reversed = value;
        this.emit("StripUpdated",this.id,["configuration"]);
    }
    setGroup(name) {
        this.sendCommand("config/group",null,{"name":name});
        this.group = name;
        this.emit("StripUpdated",this.id,["configuration"]);
    }
    removeFromQueue(command) {
        var newQueue = [];
        _.each(this._queue,function(queued) {
            if (!queued[0].startsWith("brightness")) {
                newQueue.push(queued);
            }
        });
        this._queue = newQueue;
    }
    setBrightness(brightness) {
        if (brightness < 0) brightness = 0;
        if (brightness > 100) brightness = 100;
        this.removeFromQueue("brightness");
        this.sendCommand("brightness?value="+brightness);
        this.brightness = brightness;
        this.emit("StripUpdated",this.id,["state"]);
    }
    toggle(value) {
        this.power = value;
        this.sendCommand(value ? "power/on" : "power/off");
    }
    loadPattern(pattern,isPreview,callback) {
        var data = pattern.pixelData;
        var bufferSize = pattern.pixels*pattern.frames*3;
        var payload = [];
        if (data.length == 0) console.log("ERROR ERROR, DATA LENGTH 0");
        for (var i=0; i<data.length; i++) payload[i] = data[i];

        var p = {
            name: pattern.name,
            frames: pattern.frames,
            pixels: pattern.pixels,
            fps: pattern.fps,
        }

        if (isPreview) p.preview = null;

        var url = "http://"+this.ip+"/pattern/create?"+param(p);
        this._busy = true;
        this._lastCommand = new Date().getTime();
        PatternLoader.upload(url,payload,function(err) {
            this._busy = false;
            if (callback) callback();
        }.bind(this));

        if (!isPreview) this.requestStatus();
    }
    downloadLightwork(patternId,cb) {
        PatternLoader.download("http://"+this.ip+"/pattern/download?id="+patternId,function(err,res) {
            var patternInfo = _.find(this.patterns,{id:patternId});
            var lw = {
                name: patternInfo.name,
                frames: patternInfo.frames,
                pixels: patternInfo.pixels,
                fps: patternInfo.fps,
                pixelData: res
            }
            if (cb) cb(lw);
        }.bind(this));
    }
    selectPattern(id) {
        this.selectedPattern = id;
        this.sendCommand("pattern/select?id="+id);
        this.emit("StripUpdated",this.id,["state"]);
    }
    forgetPattern(id) {
        this.sendCommand("pattern/forget?id="+id);
        this.requestStatus();
    }
    disconnectStrip() {
        this.sendCommand("disconnect");
        this.disconnectClient();
    }
    getName() {
        return this.name;
    }
}

LEDStrip.probeStrip = function(ip,cb) {
    var url = "http://"+ip+"/status";
    fetch(url,{timeout: 1000})
        .catch(function(err) {
            cb(null,ip);
        })
        .then((response) => response ? response.json() : null)
        .then(function(json) {
            if (json == null) return cb(null,ip);
            var strip = new LEDStrip(json.mac,ip);
            strip.receivedStatus(json,null);
            cb(strip,ip);
        }.bind(this));
}

export default LEDStrip;
