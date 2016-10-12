var EventEmitter = require("events").EventEmitter;
var dgram = require("react-native-udp")
var extend = require("extend");
var util = require("util");
var _ = require("lodash");

function toByteArray(obj) {
    var uint = new Uint8Array(obj.length);
    for (var i = 0, l = obj.length; i < l; i++){
        uint[i] = obj.charCodeAt(i);
    }

    return new Uint8Array(uint);
}

var discoveryProbe = toByteArray(
    "M-SEARCH * HTTP/1.1\r\n" +
    "HOST:239.255.255.250:1900\r\n" +
    "MAN:\"ssdp:discover\"\r\n" +
    "ST:ssdp:allrn" + // Essential, used by the client to specify what they want to discover, eg "ST:ge:fridge"
    "MX:1\r\n" + // 1 second to respond (but they all respond immediately?)
    "\r\n"
);

var TIMEOUT_DELAY = 5000;

var This = function() {
    this.init.apply(this,arguments);
}

util.inherits(This, EventEmitter);
extend(This.prototype,{
    init:function() {
        this.endpoints = {};

        this.client = dgram.createSocket("udp4");
        this.client.bind(1900);
        this.client.on("message", this.messageReceived.bind(this));

        //this.client.on("error", function() { console.log("err",arguments) });
        //this.client.on("close", function() { console.log("close",arguments) });

        /*
        setInterval(function() {
            console.log("endpoints: ",this.endpoints);
        }.bind(this),3000);
        */

        this.client.on("listening",function() {
            setInterval(this.sendProbe.bind(this),2000);
            this.sendProbe();
        }.bind(this));
    },
    sendProbe: function() {
        this.client.send(discoveryProbe, 0, discoveryProbe.length, 1900, "239.255.255.250");

        var currentTime = new Date().getTime();

        //Filter out old hits
        var remove = _.pick(this.endpoints,function(value,key) { return currentTime - value > TIMEOUT_DELAY});
        _.each(remove,function(value,key) {
            delete this.endpoints[key];
            //Flickerstrip hasn't been seen for a bit, we'll remove it
            this.emit("Lost",key);
        }.bind(this));
    },
    messageReceived: function(msg, rinfo) {
        var strmsg = String.fromCharCode.apply(null, msg);
        var lines = strmsg.split("\r\n");
        var messageData = {};
        _.each(lines,function(line) {
            let [key, ...value] = line.split(":")
            value = value.join(":").trim();
            messageData[key] = value;
        });
        var isFlickerstrip = messageData["SERVER"] && messageData["SERVER"].indexOf("Flickerstrip") != -1;
        if (isFlickerstrip) {
            var address = rinfo.address;
            if (!this.endpoints[address]) {
                //New flickerstrip found!
                this.emit("Found",address);
            }
            this.endpoints[address] = new Date().getTime();
        }
    },
    markLost:function(ip) {
        if (this.endpoints[ip]) {
            delete this.endpoints[ip];
        }
    }
});

export default This;
