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
    loadPattern: function(stripId, pattern) {
        FlickerstripDispatcher.dispatch({
            type: ActionTypes.LOAD_PATTERN,
            stripId: stripId,
            pattern: pattern,
        });
    },
    loadPreview: function(stripId, pattern) {
        FlickerstripDispatcher.dispatch({
            type: ActionTypes.LOAD_PREVIEW,
            stripId: stripId,
            pattern: pattern,
        });
    },
    selectPattern: function(stripId, patternId) {
        FlickerstripDispatcher.dispatch({
            type: ActionTypes.SELECT_PATTERN,
            stripId: stripId,
            patternId: patternId,
        });
    },
    deletePattern: function(stripId, patternId) {
        FlickerstripDispatcher.dispatch({
            type: ActionTypes.DELETE_PATTERN,
            stripId: stripId,
            patternId: patternId,
        });
    },
    configure: function(stripId, opt) {
        FlickerstripDispatcher.dispatch({
            type: ActionTypes.CONFIGURE,
            stripId: stripId,
            opt: opt,
        });
    },
    downloadLightwork: function(stripId, lightworkId) {
        FlickerstripDispatcher.dispatch({
            type: ActionTypes.DOWNLOAD_LIGHTWORK,
            stripId: stripId,
            lightworkId: lightworkId,
        });
    },
    forgetNetwork: function(stripId) {
        FlickerstripDispatcher.dispatch({
            type: ActionTypes.FORGET_NETWORK,
            stripId: stripId,
        });
    },
};
