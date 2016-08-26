define(["jquery","tinycolor2","shared/Pattern","view/util.js","view/SelectList.js","view/LEDStripRenderer.js","view/ControlsView.js","view/EditPatternDialog.js","view/Tabs.js","text!tmpl/loadPatternDialogMobile.html"],
function($,tinycolor,Pattern,util,SelectList,LEDStripRenderer,ControlsView,EditPatternDialog,Tabs,template) {
    var This = function() {
        this.init.apply(this,arguments);
    }

    $.extend(This.prototype, {
        init:function(conduit,gui) {
            this.conduit = conduit;
            this.gui = gui;
            this.$el = $("<div class='loadPatternDialog'/>");

            this.$el.append(template);
            this.$el = this.$el.children();
			this.$preview = this.$el.find(".preview");

            this.tabs = new Tabs({
                "basic":{"label":"Basic","default":true},
                "user":{"label":"User"},
                "server":{"label":"Shared"}
            });

            util.bindClickEvent(this.$el.find(".createPattern").hide(),_.bind(function() {
                this.editPatternDialog = new EditPatternDialog(this.conduit,this.gui,null).show();
                this.stripRenderer.stop();
                $(this.editPatternDialog).on("Save",_.bind(function(e,pattern) {
                    this.conduit.emit("SavePattern",pattern);
                    this.editPatternDialog.hide();
                    this.stripRenderer.start();
                },this));
            },this));

            $(this.tabs).on("select",_.bind(function(e,key) {
                console.log("tab selectd",key);
                this.$el.find(".createPattern").toggle(key == "user");
                if (key == "basic") this.showPatterns(this.gui.basicPatterns);
                if (key == "user") this.showPatterns(this.gui.userPatterns,true);
                if (key == "server") this.refreshPatterns();
            },this));
            this.$el.find(".tabs").append(this.tabs.$el);
            this.showPatterns(this.gui.basicPatterns);
            $(this.gui).on("BasicPatternsLoaded PatternsLoaded",_.bind(function() {
                var key = this.tabs.getSelectedKey();
                if (key == "basic") this.showPatterns(this.gui.basicPatterns);
                if (key == "user") this.showPatterns(this.gui.userPatterns,true);
            },this));

			util.bindClickEvent(this.$el.find(".loadPatternButton"),_.bind(this.loadPatternClicked,this));
			util.bindClickEvent(this.$el.find(".previewPatternButton"),_.bind(this.previewPatternClicked,this));

            util.bindClickEvent(this.$el.find(".hideButton"),_.bind(function() {
                this.hide()
            },this));

            var ledCount = 150;
            this.stripRenderer = new LEDStripRenderer(ledCount);
            this.$preview.empty().append(this.stripRenderer.$el);
            this.$el.find(".patternlist").addClass("empty");
        },
        refreshPatterns:function() {
            this.$el.find(".right").addClass("deselected");
            this.conduit.request("RefreshServerPatterns",_.bind(function(patterns) {
                this.showPatterns(patterns);
            },this));
        },
        showPatterns:function(patterns,editable) {
            this.editable = editable;
            this.patternSelect = new SelectList(patterns,this.patternOptionRenderer,this,{multiple:false});
            this.$el.find(".patternlist").empty().append(this.patternSelect.$el).removeClass("empty");
            $(this.patternSelect).on("change",_.bind(this.patternSelected,this));
        },
        getPattern:function(patternSpec) { //TODO dedupe me
            var args = {};
            if (patternSpec.controls) {
                _.each(patternSpec.controls,function(control) {
                    args[control.id] = control.default;
                });
            }
            if (typeof(patternSpec.pattern) === "function") return patternSpec.pattern(args);
            return patternSpec.pattern;
        },
	    previewPatternClicked:function() {
			this.conduit.emit("LoadPattern",this.gui.selectedStrips[0].id,this.selectedPattern,true);
	    },
	    loadPatternClicked:function() {
			this.conduit.emit("LoadPattern",this.gui.selectedStrips[0].id,this.selectedPattern,false);
			this.hide();
	    },
        patternSelected:function(e,selectedObjects,selectedIndexes) {
            if (selectedObjects.length == 0) return;

            var pattern = selectedObjects[0];
            if (!pattern.body && pattern.id) {
                this.conduit.request("LoadServerPattern",pattern.id,_.bind(function(id,patternData) {
                    var pattern = new Pattern();
                    _.extend(pattern,patternData);

                    this.selectedPattern = pattern;
                    console.log("selected",pattern);

                    this.stripRenderer.setPattern(pattern);

                    setTimeout(_.bind(function() {
                        this.stripRenderer.resizeToParent();
                    },this),5);
                },this));
            } else {
                this.selectedPattern = pattern;
                this.stripRenderer.setPattern(pattern);

                setTimeout(_.bind(function() {
                    this.stripRenderer.resizeToParent();
                },this),5);
            }
        },
        patternOptionRenderer:function(pattern,$el) {
            if ($el) {
                $el.find(".name").text(pattern.name);
                var aside = pattern.Owner ? pattern.Owner.display : "";
                $el.find(".aside").text(aside); 
            } else {
                $el = $("<ul class='list-group-item listElement' />");
                $el.append($("<span class='name'></span>").text(pattern.name));
                var aside = pattern.Owner ? pattern.Owner.display : "";
                $el.append($("<span class='aside'></span>").text(aside));

                var $edit = $("<button class='btn btn-default editButton asideButton'><span class='glyphicon glyphicon-pencil'></span></button>");
                util.bindClickEvent($edit,_.bind(function(e) {
                    var pattern = $(e.target).closest(".listElement").data("object");
                    this.editPatternDialog = new EditPatternDialog(this.conduit,this.gui,pattern).show();
                    this.stripRenderer.stop();
                    $(this.editPatternDialog).on("Save",_.bind(function(e,pattern) {
                        this.conduit.emit("SavePattern",pattern);
                        this.editPatternDialog.hide();
                        this.stripRenderer.start();
                    },this));
                },this));
                if (this.editable && pattern.type == "bitmap") {
                    $el.append($edit);
                    $el.addClass("hasAsideButton");
                }
            }
            return $el;
        },
        show:function() {
            if (platform == "mobile") {
                var $mainContainer = $(document.body).find(".mainContainer");
                $mainContainer.append(this.$el);
            } else {
                $(document.body).append(this.$el);
                this.$el.modal('show');
            }
            
            setTimeout(function() {
                $(document.body).addClass("loadPatternShowing");
            },5);
        },

        hide:function() {
            var $body = $(document.body);
            $(document.body).removeClass("loadPatternShowing");
            $(document.body).removeClass("configurePatternShowing");
            this.$el.find(".hideButton").unbind("click");

            if (platform == "desktop") {
                this.$el.modal('hide');
                this.$el.remove();
            } else if (platform == "mobile") {
                setInterval(_.bind(function() { //delay until the animation finishes
                    this.$el.remove();
                },this),500);
            }
            this.destroy();
        },

        destroy:function() {
            this.stripRenderer.destroy();
        }
    });

    return This;
});
