var EventEmitter = require("events").EventEmitter;

var _ = require("lodash");

var b64 = require("base64-js");

import Configuration from "~/constants/Configuration";

function getBytes(str) {
    var bytes = [];
    for (var i = 0; i < str.length; ++i) {
        bytes.push(str.charCodeAt(i));
    }
    return bytes;
};


class UserService extends EventEmitter {
    static getAuthorizationHeader(user) {
        return "Basic " + b64.fromByteArray(getBytes(user.username + ":" + user.password));
    }
    static validateUser(username,password,cb) {
        var opt = {
            method: "POST",
        };

        opt.headers = {};
        opt.headers["Authorization"] = UserService.getAuthorizationHeader({username:username,password:password});

        fetch(Configuration.LIGHTWORK_ENDPOINT+"/user/challenge",opt)
            .then((response) => response.ok ? response.json() : cb(false,null))
            .then(function(json) {
                if (json) cb(true,json);
            });
    }
}

export default UserService;


