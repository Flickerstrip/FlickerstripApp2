var _ = require("lodash");

import FlickerstripDispatcher from "~/dispatcher/FlickerstripDispatcher.js";
import ActionTypes from "~/constants/ActionTypes.js";
import FlickerstripManager from "~/stores/FlickerstripManager.js";
import LightworkManager from "~/stores/LightworkManager.js";
import StripActions from "~/actions/StripActions.js";
import LightworkActions from "~/actions/LightworkActions.js";

export default {
    loadSelectedLightworksToSelectedStrips: function() {
        var flickerstrips = FlickerstripManager.getSelectedFlickerstrips();
        var lightworks = LightworkManager.getSelectedLightworks();
        _.each(flickerstrips,function(fs) {
            _.each(lightworks,function(lw) {
                LightworkActions.loadLightwork(lw.id,function(lw) {
                    StripActions.loadPattern(fs.id,lw);
                });
            }.bind(this));
        }.bind(this));
    },
};

