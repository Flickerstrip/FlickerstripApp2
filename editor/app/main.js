require(['underscore','jquery','shared/Pattern.js','view/EditPatternDialog.js','bootstrap'],function(_,$,Pattern,EditPatternDialog) {
    var readyRun = false;

    var initialize = function() {
        var p = typeof window.injectedPattern !== "undefined" ? _.extend(new Pattern(),window.injectedPattern) : null;

        if (p) p.palette = Pattern.resizePalette(p.palette,5);
        window.editPatternDialog = new EditPatternDialog(null,null,p,$(".lightworkEditor"));

        setTimeout(function() {
            if (WebViewBridge) {
                $(window.editPatternDialog).on("PatternUpdated",function(e,pattern) {
                    WebViewBridge.send(JSON.stringify({"command":"update","lightwork":pattern}));
                });

                WebViewBridge.onMessage = function(reactNativeData) {
                    var json = JSON.parse(reactNativeData);

                    if (json.command) {
                        var command = json.command;
                        if (command == "load") {
                            json.lightwork.palette = Pattern.resizePalette(json.lightwork.palette,5);
                            window.editPatternDialog.loadPattern(json.lightwork);
                        }
                    }
                };
                //WebViewBridge.send(JSON.stringify({"command":"ready"}));
            }
        }.bind(this),100);
    };

    window.platform = "mobile";
    window.isTablet = false;
    window.injectExecuted = function() {
        if (readyRun) {
            var p = _.extend(new Pattern(),window.injectedPattern);
            p.palette = Pattern.resizePalette(p.palette,5);
            window.editPatternDialog.loadPattern(json.lightwork);
        }
    }

    $(document).ready(function() {
        var testInitialize = false;

        if (testInitialize) {
            $("<button>Clickme</button>").css({"z-index":"1000","position":"absolute"}).click(function() {
                $(this).remove();
                initialize();
            }).prependTo($("body"));
        } else {
            initialize();
        }
    });
});

