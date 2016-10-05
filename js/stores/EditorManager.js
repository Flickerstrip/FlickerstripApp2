var EventEmitter = require("events").EventEmitter;
var _ = require("lodash");

import FlickerstripDispatcher from "~/dispatcher/FlickerstripDispatcher.js";
import LightworkManager from "~/stores/LightworkManager.js";
import ActionTypes from "~/constants/ActionTypes.js";
import Pattern from "~/models/Pattern";

class EditorManager extends EventEmitter {
    constructor(props) {
        super(props);

        this.lightworks = [];
        this.activeLightwork = null;

        FlickerstripDispatcher.register(function(e) {
            if (e.type === ActionTypes.EDITOR_OPEN_LIGHTWORK) {
                LightworkManager.getLightworkData(e.lightworkId,function(lw) {
                    this.addLightwork(_.cloneDeep(lw));
                }.bind(this));
            } else if (e.type === ActionTypes.EDITOR_CLOSE_LIGHTWORK) {
                this.lightworks.splice(this.lightworkIndexById(e.lightworkId),1);
                if (e.lightworkId == this.activeLightwork) {
                    this.activeLightwork = this.lightworks.length ? this.lightworks[0].id : null;
                    this.emit("ActiveLightworkChanged",this.activeLightwork);
                }
            } else if (e.type === ActionTypes.EDITOR_CREATE_LIGHTWORK) {
                var lw = _.cloneDeep(Pattern.DEFAULT_PATTERN);
                lw.id = this.createLightworkId();
                this.addLightwork(lw);
            } else if (e.type === ActionTypes.EDITOR_SAVE_LIGHTWORK) {
                var i = this.lightworkIndexById(e.lightworkId);
                LightworkManager.saveLightwork(e.lightworkId,this.lightworks[i]);
            }
        }.bind(this));
    }
    lightworkEdited(lightworkId,lw) {
        this.lightworks[this.lightworkIndexById(lightworkId)] = lw;
    }
    createLightworkId() {
        var id = null;
        while(!id || _.find(this.lightworks,{id:id})) {
            id = "tmp_"+Math.ceil(Math.random()*100000);
        }
        return id;
    }
    addLightwork(lw) {
        this.lightworks.push(lw);
        this.activeLightwork = lw.id;
        this.emit("ActiveLightworkChanged",this.activeLightwork);
    }
    getActiveLightwork() {
        if (!this.activeLightwork) return false;
        var active = this.lightworks[this.lightworkIndexById(this.activeLightwork)];
        return active;
    }
    lightworkIndexById(lightworkId) {
        return _.findIndex(this.lightworks,{id:lightworkId});
    }
}

var editorManager = new EditorManager();
export default editorManager;

