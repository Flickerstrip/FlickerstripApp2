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
        this.navigationBarRefresher = new EventEmitter();

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
                lw.id = LightworkManager.createLightworkId();
                this.addLightwork(lw);
            } else if (e.type === ActionTypes.EDITOR_SAVE_LIGHTWORK) {
                var i = this.lightworkIndexById(e.lightworkId);
                var id = e.lightworkId;
                if ((""+id).indexOf("tmp_") == 0) id = null;
                LightworkManager.saveLightwork(id,this.lightworks[i],function(saveId,lw) {
                    if (id == null && this.activeLightork == id) {
                        this.activeLightwork = saveId;
                        this.lightworks[i].id = saveId;
                    }
                }.bind(this));
            }
        }.bind(this));
    }
    getNavigationBarRefresher() {
        return this.navigationBarRefresher;
    }
    getLightwork(lightworkId) {
        var index = this.lightworkIndexById(lightworkId);
        if (index === -1) return null;
        return this.lightworks[index];
    }
    lightworkEdited(lightworkId,lw) {
        var parametersChanged = _.filter(_.keys(lw),function(param) {
            return lw[param] != this.lightworks[this.lightworkIndexById(lightworkId)][param];
        }.bind(this));

        _.extend(this.lightworks[this.lightworkIndexById(lightworkId)],lw);

        var nameChanged = _.intersection(parametersChanged,["name"]).length;

        if (parametersChanged.length > 0 && lightworkId == this.activeLightwork) {
            this.emit("ActiveLightworkChanged",this.activeLightwork);
        }
        if (nameChanged) {
            this.navigationBarRefresher.emit("Refresh");
        }
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

