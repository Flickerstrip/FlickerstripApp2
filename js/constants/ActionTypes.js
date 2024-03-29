var keyMirror = require("keymirror");

export default keyMirror({
    SELECT_STRIP: null,
    DESELECT_STRIP: null,
    TOGGLE_POWER: null,
    LOAD_PATTERN: null,
    LOAD_PREVIEW: null,
    DELETE_PATTERN: null, //care of duplicate name when refactoring "delete_lightwork" exists, disambiguate me
    CONFIGURE: null,
    DOWNLOAD_LIGHTWORK: null,
    FORGET_NETWORK: null,
    UPDATE_FIRMWARE: null,
    UPDATE_ALL_FIRMWARE: null,
    ADD_BY_IP: null,

    SELECT_LIGHTWORK: null,
    DESELECT_LIGHTWORK: null,
    LOAD_LIGHTWORK: null,
    PUBLISH_LIGHTWORK: null,
    EDIT_LIGHTWORK: null,
    STAR_LIGHTWORK: null,
    DELETE_LIGHTWORK: null,
    DUPLICATE_LIGHTWORK: null,
    CONFIGURE_LIGHTWORK: null,

    EDITOR_OPEN_LIGHTWORK: null,
    EDITOR_CLOSE_LIGHTWORK: null,
    EDITOR_CREATE_LIGHTWORK: null,
    EDITOR_SAVE_LIGHTWORK: null,

    USER_LOGIN: null,
    USER_LOGOUT: null,
    WIFI_SAVE: null,
    PURGE_LIGHTWORK_CACHE: null,
});
