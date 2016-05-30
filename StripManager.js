var EventEmitter = require('events').EventEmitter;

var DiscoveryService = require('./DiscoveryService');
var LEDStrip = require('./LEDStrip');

class This extends EventEmitter {
  constructor(props) {
    super(props);
    this.discover = new DiscoveryService();

    this.discover.on("Found",this.onStripDiscovered.bind(this));
    this.discover.on("Lost",this.onStripLost.bind(this));

    this.strips = {};
  }
  onStripDiscovered(ip) {
    console.log("strip discovered",ip);
    LEDStrip.probeStrip(ip,function(strip) {
      console.log("probed strip",strip);
      if (this.strips[strip.id]) {
        console.log("emitting connected");
        this.emit("StripConnected",strip);
      } else {
        console.log("emitting added");
        this.strips[strip.id] = strip;
        this.emit("StripAdded",strip);
      }
    }.bind(this));
  }
  onStripLost(ip) {
    console.log("strip lost",ip);
    var removeList = _.compact(_.map(this.strips,function(strip) { return strip.ip === ip ? strip.id : false}));
    console.log("remove list: (TODO REMOVE THINGS) ",removeList);
  }
}

var instance = new This();
module.exports = {
  getInstance:function() {
    return instance;
  }
};
