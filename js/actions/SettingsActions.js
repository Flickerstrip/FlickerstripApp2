import FlickerstripDispatcher from "~/dispatcher/FlickerstripDispatcher.js";
import ActionTypes from "~/constants/ActionTypes.js";

export default {
    userLogin:function(email,password) {
        FlickerstripDispatcher.dispatch({
            type: ActionTypes.USER_LOGIN,
            email: email,
            password: password,
        });
    },
    userLogout:function() {
        FlickerstripDispatcher.dispatch({
            type: ActionTypes.USER_LOGOUT,
        });
    },
    saveWifi:function(ssid,password) {
        FlickerstripDispatcher.dispatch({
            type: ActionTypes.WIFI_SAVE,
            ssid: ssid,
            password: password,
        });
    },
    purgeLightworkCache:function() {
        FlickerstripDispatcher.dispatch({
            type: ActionTypes.PURGE_LIGHTWORK_CACHE,
        });
    }
};

