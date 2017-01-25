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
    loadLightwork: function(lightworkId) {
        FlickerstripDispatcher.dispatch({
            type: ActionTypes.LOAD_LIGHTWORK,
            lightworkId: lightworkId,
        });
    },
    publishLightwork: function(lightworkId, state) {
        state = state === undefined ? true : state;
        FlickerstripDispatcher.dispatch({
            type: ActionTypes.PUBLISH_LIGHTWORK,
            lightworkId: lightworkId,
            state: state,
        });
    },
    editLightwork: function(lightworkId, props) {
        FlickerstripDispatcher.dispatch({
            type: ActionTypes.EDIT_LIGHTWORK,
            lightworkId: lightworkId,
            props: props,
        });
    },
    starLightwork: function(lightworkId, state) {
        state = state === undefined ? true : state;
        FlickerstripDispatcher.dispatch({
            type: ActionTypes.STAR_LIGHTWORK,
            lightworkId: lightworkId,
            state: state,
        });
    },
    deleteLightwork: function(lightworkId) {
        FlickerstripDispatcher.dispatch({
            type: ActionTypes.DELETE_LIGHTWORK,
            lightworkId: lightworkId,
        });
    },
    duplicateLightwork: function(lightworkId,duplicateName) {
        FlickerstripDispatcher.dispatch({
            type: ActionTypes.DUPLICATE_LIGHTWORK,
            lightworkId: lightworkId,
            name: duplicateName,
        });
    },
    configureLightwork: function(lightworkId,configuration) {
        FlickerstripDispatcher.dispatch({
            type: ActionTypes.CONFIGURE_LIGHTWORK,
            lightworkId: lightworkId,
            configuration: configuration,
        });
    },
};

