import FlickerstripDispatcher from "~/dispatcher/FlickerstripDispatcher.js";
import ActionTypes from "~/constants/ActionTypes.js";

export default {
    selectLightwork: function(lightworkId) {
        FlickerstripDispatcher.dispatch({
            type: ActionTypes.SELECT_LIGHTWORK,
            lightworkId: lightworkId
        });
    },
    deselectLightwork: function(lightworkId) {
        FlickerstripDispatcher.dispatch({
            type: ActionTypes.DESELECT_LIGHTWORK,
            lightworkId: lightworkId
        });
    },
};

