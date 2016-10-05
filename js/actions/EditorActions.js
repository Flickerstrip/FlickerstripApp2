import FlickerstripDispatcher from "~/dispatcher/FlickerstripDispatcher.js";
import ActionTypes from "~/constants/ActionTypes.js";

export default {
    openLightwork: function(lightworkId) {
        FlickerstripDispatcher.dispatch({
            type: ActionTypes.EDITOR_OPEN_LIGHTWORK,
            lightworkId: lightworkId,
        });
    },
    closeLightwork: function(lightworkId) {
        FlickerstripDispatcher.dispatch({
            type: ActionTypes.EDITOR_CLOSE_LIGHTWORK,
            lightworkId: lightworkId,
        });
    },
    createLightwork: function() {
        FlickerstripDispatcher.dispatch({
            type: ActionTypes.EDITOR_CREATE_LIGHTWORK,
        });
    },
    saveLightwork: function(lightworkId) {
        FlickerstripDispatcher.dispatch({
            type: ActionTypes.EDITOR_SAVE_LIGHTWORK,
            lightworkId: lightworkId,
        });
    },
};

