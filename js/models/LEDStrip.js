var EventEmitter = require("events").EventEmitter;
var util = require("util");
var _ = require("lodash");
//var fs = require("fs");
var Pattern = require("~/models/Pattern.js");
var b64 = require("base64-js");

import { NativeModules } from 'react-native';
var PatternLoader = NativeModules.PatternLoader;

var visibleTimeout = 9000;

function param(params) {
    var query = Object.keys(params)
        .map(function(k) { return params[k] == null ? encodeURIComponent(k) : encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); })
        .join('&');
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
            console.log("Client disconnected: "+this.ip);
            this.ip = null;
            this._busy = false;
            this._queue = [];
            this.stopWatchdogTimer();
            this.emit("Strip.StatusUpdated",{"visible":false});
        }
    }
    /*
    uploadFirmware(path) {
        clearInterval(this._timer); this._timer = null;
        fs.readFile(path,_.bind(function(err,data) {
            var hexSize = data.length
            console.log("Uploading Firmware: ",path,hexSize);
            request.put({uri:"http://"+this.ip+"/update",body:data}).on("end",_.bind(function(error, response, body) {
                console.log("upload complete!");
            },this));
        },this));
    }*/
    receivedStatus(status,err) {
        if (err) {
            if (this.visible) this.setVisible(false);
            return;
        }
        if (!status || status["type"] != "status") status = {};
        var changedProperties = [];
        _.forOwn(status,function(value,key) {
            var change = typeof value == "object" ? JSON.stringify(this[key]) != JSON.stringify(value) : this[key] != value;
            if (change) changedProperties.push(key);
        }.bind(this));

        if (changedProperties.length) console.log("Changed: ",changedProperties);

        _.extend(this,status);

        this.setVisible(true);
        this.status = true;
        status.visible = this.visible;
        status.ip = this.ip;
        this.emit("Strip.StatusUpdated",status);

        //Send events based on what changed
        var events = [];
        if (_.contains(changedProperties,"patterns")) events.push("patterns");
        if (_.intersection(changedProperties,["name","group","length","start","end","fade","reversed","cycle"]).length) events.push("configuration");
        if (_.intersection(changedProperties,["brightness","selectedPattern","memory"]).length) events.push("state");

        if (events.length) this.emit("StripUpdated",this.id,events);
    }
    handleQueue() {
        if (!this._queue.length) return;

        var args = this._queue.shift();
        this.sendCommand.apply(this,args);
    }
    sendCommand(command,cb,data,notimeout) {
        if (!this.ip) {
            console.log("ERROR: sending command to disconnected strip");
            cb(null,"DISCONNECTED");
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
        if (data && typeof data === 'object') {
            console.log("stringifying data..");
            data = JSON.stringify(data);
        }
        */
        var opt = {};
        if (data) {
            opt.method = "POST";
            opt.body = data;
        }
        //if (!notimeout) opt.timeout = 2000; TODO reimplement timeout? Does it exist?
        //For upload status: r.req.connection.socket._bytesDispatched

        fetch(url,opt)
            .catch(function(err) {
                console.log("error",err);
                this.setVisible(false);
                if (err.code != "ETIMEDOUT") console.log("error!",err,command);
                if (cb) cb(null,err.code);
                return;
            }.bind(this))
            .then((response) => response.json())
            .then(function(responseJson) {
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
    }
    setCycle(seconds) {
        if (seconds === false) seconds = 0;
        this.sendCommand("config/cycle?value="+parseInt(seconds));
    }
    setLength(length) {
        this.sendCommand("config/length?value="+parseInt(length));
    }
    setStart(value) {
        if (value === false) value = 0;
        this.sendCommand("config/start?value="+parseInt(value));
    }
    setEnd(value) {
        if (value === false) value = -1;
        this.sendCommand("config/end?value="+parseInt(value));
    }
    setFade(value) {
        if (value === false) value = 0;
        this.sendCommand("config/fade?value="+parseInt(value));
    }
    setReversed(value) {
        this.sendCommand("config/reversed?value="+(value ? 1 : 0));
    }
    setGroup(name) {
        this.sendCommand("config/group",null,{"name":name});
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
    }
    toggle(value) {
        this.power = value;
        this.sendCommand(value ? "power/on" : "power/off");
    }
    loadPattern(pattern,isPreview,callback) {
        var data = pattern.pixelData;
        var bufferSize = pattern.pixels*pattern.frames*3;
        var payload = [];
        for (var i=0; i<data.length; i++) payload[i] = data[i];

        var p = {
            name: pattern.name,
            frames: pattern.frames,
            pixels: pattern.pixels,
            fps: pattern.fps,
        }

        if (isPreview) p.preview = null;

        var url = "http://"+this.ip+"/pattern/create?"+param(p);
        PatternLoader.upload(url,payload,function(err,res) {
            //console.log("got result",arguments); //TODO implement this callback
        });

        if (!isPreview) this.requestStatus();
    }
    selectPattern(id) {
        this.sendCommand("pattern/select?id="+id);
    }
    forgetPattern(id) {
        this.sendCommand("pattern/forget?id="+id);
        this.requestStatus();
    }
    disconnectStrip() {
        this.sendCommand("disconnect");
    }
    getName() {
        return this.name;
    }
}

LEDStrip.probeStrip = function(ip,cb) {
    var url = "http://"+ip+"/status";
    fetch(url)
        .catch(function(err) {
            cb(null);
        })
        .then((response) => response ? response.json() : null)
        .then(function(json) {
            var strip = new LEDStrip(json.mac,ip);
            strip.receivedStatus(json,null);
            cb(strip);
        }.bind(this));
}

export default LEDStrip;
