var FlickerstripDispatcher = require("./FlickerstripDispatcher");
var ActionTypes = require("../constants/ActionTypes");

module.exports = {
  selectStrip: function(threadID) {
    ChatAppDispatcher.dispatch({
      type: ActionTypes.CLICK_THREAD,
      threadID: threadID
    });
  }
  selectStrip
};
