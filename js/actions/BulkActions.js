var _ = require("lodash");

import FlickerstripDispatcher from "~/dispatcher/FlickerstripDispatcher.js";
import ActionTypes from "~/constants/ActionTypes.js";
import FlickerstripManager from "~/stores/FlickerstripManager.js";
import LightworkManager from "~/stores/LightworkManager.js";
import StripActions from "~/actions/StripActions.js";
import LightworkActions from "~/actions/LightworkActions.js";
import TaskManager from "~/stores/TaskManager.js";

export default {
    loadSelectedLightworksToSelectedStrips: function() {
        var flickerstrips = FlickerstripManager.getSelectedFlickerstrips();
        var lightworks = LightworkManager.getSelectedLightworks();

        var taskId = TaskManager.start(1,"upload",{ name:"Uploading Lightworks", totalSteps:flickerstrips.length * lightworks.length});
        _.each(flickerstrips,function(fs) {
            _.each(lightworks,function(lw) {
                LightworkManager.getLightworkData(lw.id,function(lw) {
                    StripActions.loadPattern(fs.id,lw,function() {
                        TaskManager.updateProgress(taskId,true,null,true);
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }.bind(this));
    },
    previewLightworkOnSelectedStrips: function(lightworkId) {
        var flickerstrips = FlickerstripManager.getSelectedFlickerstrips();
        var taskId = TaskManager.start(1,"upload",{ name:"Previewing Lightwork", totalSteps:flickerstrips.length});
        _.each(flickerstrips,function(fs) {
            LightworkManager.getLightworkData(lightworkId,function(lw) {
                StripActions.loadPattern(fs.id,lw,function() {
                    TaskManager.updateProgress(taskId,true,null,true);
                }.bind(this));
            }.bind(this));
        }.bind(this));
    },
    selectedStripPowerToggle: function(power) {
        var flickerstrips = FlickerstripManager.getSelectedFlickerstrips();
        _.each(flickerstrips,function(fs) {
            StripActions.togglePower(fs.id,power);
        }.bind(this));
    },
};

