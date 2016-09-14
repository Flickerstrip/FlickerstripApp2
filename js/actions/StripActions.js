import FlickerstripDispatcher from "~/dispatcher/FlickerstripDispatcher.js";
import ActionTypes from "~/constants/ActionTypes.js";

export default {
    selectStrip: function(stripId) {
        FlickerstripDispatcher.dispatch({
            type: ActionTypes.SELECT_STRIP,
            stripId: stripId
        });
    },
    deselectStrip: function(stripId) {
        FlickerstripDispatcher.dispatch({
            type: ActionTypes.DESELECT_STRIP,
            stripId: stripId
        });
    },
    togglePower: function(stripId, power) {
        FlickerstripDispatcher.dispatch({
            type: ActionTypes.TOGGLE_POWER,
            stripId: stripId,
            power: power,
        });
    },
};
