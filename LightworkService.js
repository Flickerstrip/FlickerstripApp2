var EventEmitter = require('events').EventEmitter;

var _ = require('lodash');
var b64 = require("base64-js");

var endpoint = "https://lightwork.hohmbody.com";

function getBytes(str) {
  var bytes = [];
  for (var i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }
  return bytes;
};

class This extends EventEmitter {
    static fetchUserLightworks(user,page,cb) {
        page = page || 0;

        var auth = user.email + ":" + user.password;
        var opt = {
            method: "GET",
            headers: {"Authorization":"Basic " + b64.fromByteArray(getBytes(auth))},
        };
       
       console.log("requesting!",opt);
       fetch(endpoint+"/user/"+user.id+"/patterns?size=20&page="+page,opt).then((response) => response.json()).then(function(data) {
           cb(data);
       }); 
    }
}

module.exports = This;

