require(['jquery','shared/Pattern.js','view/EditPatternDialog.js','bootstrap'],function($,Pattern,EditPatternDialog) {
    $(document).ready(function() {

        window.platform = "mobile";
        window.isTablet = false;
        var This = function() {
            this.editPatternDialog = new EditPatternDialog(this,null,null,$(".lightworkEditor"));

            setTimeout(function() {
                if (WebViewBridge) {
                    WebViewBridge.onMessage = function(reactNativeData) {
                        var json = JSON.parse(reactNativeData);

                        if (json.command) {
                            var command = json.command;
                            if (command == "load") {
                                this.editPatternDialog.loadPattern(json.lightwork);
                            }
                        }

                    };

                    WebViewBridge.send(JSON.stringify({"command":"ready"}));
                }
            },100);
        }();

    });
});

