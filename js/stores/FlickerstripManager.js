var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');

var DiscoveryService = require('./DiscoveryService');
var LEDStrip = require('./LEDStrip');
var FlickerstripDispatcher = require('./FlickerstripDispatcher');

class FlickerstripManager extends EventEmitter {
  constructor(props) {
    super(props);

    this.discover = new DiscoveryService();

    this.discover.on("Found",this.onStripDiscovered.bind(this));
    this.discover.on("Lost",this.onStripLost.bind(this));

    FlickerstripDispatcher.register(function(payload) {
        if (payload.actionType === 'select-strip') {
            FlickerstripManager.findStripById(payload.stripId).selected = true;
        } else if (payload.actionType === 'deselect-strip') {
            FlickerstripManager.findStripById(payload.stripId).selected = false;
        }
    });


    this.strips = {};
  }
  findStripIdByIp(ip) {
    var found = null;
    _.each(this.strips,function(value,key) {
        if (value.ip == ip) found = key;
    });
    return found;
  }
  findStripIdById(id) {
    var found = null;
    _.each(this.strips,function(value,key) {
        if (value.id == id) found = key;
    });
    return found;
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

var instance = new FlickerstripManager();
module.exports = {
  getInstance:function() {
    return instance;
  }
};
