var EventEmitter = require('events').EventEmitter;

var DiscoveryService = require('./DiscoveryService');
var LEDStrip = require('./LEDStrip');
var _ = require('lodash');

class This extends EventEmitter {
  constructor(props) {
    super(props);
    this.discover = new DiscoveryService();

    this.discover.on("Found",this.onStripDiscovered.bind(this));
    this.discover.on("Lost",this.onStripLost.bind(this));

    this.strips = {};
  }
  findStripIdByIp(ip) {
    var found = null;
    _.each(this.strips,function(value,key) {
        if (value.ip == ip) found = key;
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
    console.log("strip lost",ip);
    //var removeList = _.compact(_.map(this.strips,function(strip) { return strip.ip === ip ? strip.id : false}));
    //console.log("remove list: (TODO REMOVE THINGS) ",removeList);

    var id = this.findStripIdByIp(ip);
    var strip = this.strips[id];
    console.log("foudn strip by ip",id,ip);
    delete this.strips[id];
    console.log("deleted item, new arry: ",_.pluck(_.values(this.strips),"ip"));

    this.emit("StripRemoved",strip);
  }
}

var instance = new This();
module.exports = {
  getInstance:function() {
    return instance;
  }
};
