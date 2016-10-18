require(['underscore','jquery','shared/Pattern.js','view/EditPatternDialog.js','bootstrap'],function(_,$,Pattern,EditPatternDialog) {
    $(document).ready(function() {

        window.platform = "mobile";
        window.isTablet = false;
        var This = function() {
            var p = new Pattern();
            _.extend(p,injectedPattern);

            this.editPatternDialog = new EditPatternDialog(this,null,p,$(".lightworkEditor"));

            setTimeout(function() {
                if (WebViewBridge) {
                    $(this.editPatternDialog).on("PatternUpdated",function(e,pattern) {
                        WebViewBridge.send(JSON.stringify({"command":"update","lightwork":pattern}));
                    });

                    WebViewBridge.onMessage = function(reactNativeData) {
                        var json = JSON.parse(reactNativeData);

                        if (json.command) {
                            var command = json.command;
                            if (command == "load") {
                                this.editPatternDialog.loadPattern(json.lightwork);
                            }
                        }

                    };

                    //WebViewBridge.send(JSON.stringify({"command":"ready"}));
                }
            },100);
        }();

    });
});

