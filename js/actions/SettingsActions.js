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
};

