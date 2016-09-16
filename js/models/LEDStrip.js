var EventEmitter = require("events").EventEmitter;
var util = require("util");
var _ = require("lodash");
//var fs = require("fs");

var visibleTimeout = 9000;

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
        if (!status) status = {};
        _.extend(this,status);
        this.setVisible(true);
        this.status = true;
        status.visible = this.visible;
        status.ip = this.ip;
        this.emit("Strip.StatusUpdated",status);
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
        this.stopWatchdogTimer();
        var url = "http://"+this.ip+"/"+command;
        if (data && typeof data === 'object' && !(data instanceof Buffer)) {
                data = JSON.stringify(data);
        }
        var opt = {};
        if (data) opt.data = data;
        if (!notimeout) opt.timeout = 2000;
        //For upload status: r.req.connection.socket._bytesDispatched
        fetch(url,opt)
            .catch(function(err) {
                this.setVisible(false);
                if (error.code != "ETIMEDOUT") console.log("error!",error,command);
                if (cb) cb(null,error.code);
                return;
            })
            .then(function(response) {
                var json = response.json();

                this.startWatchdogTimer();
                this._busy = false;

                if (cb) cb(json);

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
    loadPattern(renderedPattern,isPreview,callback) {
        console.log("TODO IMPLEMENT ME");
        /*
        var frames = renderedPattern.rendered.frames;
        var pixels = renderedPattern.rendered.pixels;
        var fps = renderedPattern.rendered.fps;
        var data = renderedPattern.rendered.data;
        var metadata = _c.packSync("PatternMetadata",{
            name:renderedPattern.name,
            address: 0,
            len: pixels*frames*3, //payload total size
            frames: frames,
            flags: 0x0000,
            fps: fps,
        });
        var page = 0;
        var bufferSize = pixels*frames*3;
        var payload = new Buffer(bufferSize);

        for (var i=0; i<data.length; i++) {
            payload.writeUInt8(data[i],i);
        }

        var concatted = Buffer.concat([metadata,payload]);

        this.sendCommand(isPreview ? "pattern/test" : "pattern/save",_.bind(function(content,err) {
            this.emit("Strip.UploadPatternComplete");
            if (callback) callback(err);
        },this),concatted,true);

        if (!isPreview) this.requestStatus();
        */
    }
    selectPattern(index) {
        if (index < 0) index = 0;
        if (index > this.patterns.length-1) index = this.patterns.length-1;
        this.selectedPattern = index;
        this.sendCommand("pattern/select?index="+index);
    }
    forgetPattern(index) {
        this.sendCommand("pattern/forget?index="+index);
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
        .then((response) => response.json())
        .then(function(json) {
            var strip = new LEDStrip(json.mac,ip);
            strip.receivedStatus(json,null);
            cb(strip);
        }.bind(this));
}

export default LEDStrip;
