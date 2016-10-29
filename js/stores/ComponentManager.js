var EventEmitter = require("events").EventEmitter;
var _ = require("lodash");

class ComponentManager extends EventEmitter {
    constructor(props) {
        super(props);
    }
}

var componentManager = new ComponentManager();
export default componentManager;



