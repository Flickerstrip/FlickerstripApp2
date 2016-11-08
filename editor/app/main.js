require(['underscore','jquery','shared/Pattern.js','view/EditPatternDialog.js','bootstrap'],function(_,$,Pattern,EditPatternDialog) {
    var initialized = false;
    var initialize = function() {
        initialized = true;
        var p = typeof window.injectedPattern !== "undefined" ? _.extend(new Pattern(),window.injectedPattern) : null;

        window.editPatternDialog = new EditPatternDialog(null,null,p,$(".lightworkEditor"));
    };

    var attachBridge = function() {
        if (WebViewBridge) {
            $(window.editPatternDialog).on("PatternUpdated",function(e,pattern) {
                WebViewBridge.send(JSON.stringify({"command":"update","lightwork":pattern}));
            });

            WebViewBridge.onMessage = function(reactNativeData) {
                var json = JSON.parse(reactNativeData);

                if (json.command) {
                    var command = json.command;
                    if (command == "load") {
                        window.editPatternDialog.loadPattern(json.lightwork);
                    }
                }
            };
            //WebViewBridge.send(JSON.stringify({"command":"ready"}));
        }
    }

    window.platform = "mobile";
    window.isTablet = false;
    window.injectExecuted = function() {
        if (!initialized) initialize();
        var p = _.extend(new Pattern(),window.injectedPattern);
        window.editPatternDialog.loadPattern(p);
    }

    $(document).ready(function() {
        if (!initialized) initialize();
        setTimeout(function() {
            attachBridge();
        }.bind(this),100);
    });
});

