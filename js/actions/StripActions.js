var FlickerstripDispatcher = require(__main + "dispatcher/FlickerstripDispatcher");
var ActionTypes = require(__main + "constants/ActionTypes");

module.exports = {
  selectStrip: function(threadID) {
    ChatAppDispatcher.dispatch({
      type: ActionTypes.CLICK_THREAD,
      threadID: threadID
    });
  }
  selectStrip
};
