var FlickerstripDispatcher = require(__js + "dispatcher/FlickerstripDispatcher");
var ActionTypes = require(__js + "constants/ActionTypes");

export default {
  selectStrip: function(threadID) {
    ChatAppDispatcher.dispatch({
      type: ActionTypes.CLICK_THREAD,
      threadID: threadID
    });
  }
  selectStrip
};
