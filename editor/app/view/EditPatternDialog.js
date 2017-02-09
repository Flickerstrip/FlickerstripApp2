define(["jquery","tinycolor2","view/util.js","view/LEDStripRenderer.js","view/CanvasPixelEditor.js","shared/Pattern.js","text!tmpl/editPatternDialog.html","text!tmpl/editPatternDialogMobile.html"],
function($,tinycolor,util,LEDStripRenderer,CanvasPixelEditor,Pattern,desktop_template,mobile_template) {
    var This = function() {
        this.init.apply(this,arguments);
    }
    
    function createCanvas(width,height) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        var g=canvas.getContext("2d");
        g.fillStyle = "#000";
        g.fillRect(0,0,width,height);

        return canvas;
    }

    $.extend(This.prototype, {
        init:function(conduit,gui,pattern,$el) {
            this.conduit = conduit;
            this.gui = gui;
			this.widgets = [];
            this.$el = $el || $("<div class='editPatternDialog'/>");
            this.$el.addClass("body bodyWithPreview bodyNoPadding noTouchEvents");

            this.$el.append(platform == "desktop" ? desktop_template : mobile_template);

            if (platform == "mobile" && !isTablet) this.$el.find(".patternControls>.right").hide();

            util.bindClickEvent(this.$el.find(".hideButton"),_.bind(function() {
                var areYouSure = confirm("Are you sure you want to discard this pattern?");
                if (areYouSure === true) this.hide()
            },this));

            if (!pattern) pattern = Pattern.DEFAULT_PATTERN;
            this.pattern = pattern.clone();

            this.$preview = this.$el.find(".patternPreview");
            this.stripRenderer = new LEDStripRenderer(75); //TODO an option to change this?
            this.$preview.empty().append(this.stripRenderer.$el);
            setTimeout(_.bind(function() {
                this.stripRenderer.resizeToParent();
            },this),100);

            this.$el.find(".swapPalette").click(function(e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).closest(".palette").toggleClass("showSpecial");
            });

            $(window).on("resize",_.bind(function() {
                this.stripRenderer.resizeToParent();
                this.editor.resizeToParent();
            },this));

            this.editor = new CanvasPixelEditor(null,this.pattern.palette,this.$el.find(".currentColor"),this.$el.find(".palette"));
            $(this.editor).on("PaletteUpdated",_.bind(function(e,palette) {
                this.pattern.palette = palette;
                $(this).trigger("PatternUpdated",[this.pattern])
            },this));
            

            $(this.canvas).css("border","1px solid black");

            this.canvas = util.renderPattern(this.pattern.pixelData,this.pattern.pixels,this.pattern.frames,null,null,false,false);
            this.editor.setImage(this.canvas);

            this.$metricsPanel = this.$el.find(".metricsPanel");

            this.$metricsPanel.click(function() {
                if ($(this).is(".showPopup")) return;

                $(this).addClass("showPopup");
                setTimeout(function() {
                   $(this).find(".fps").select(); 
                }.bind(this),50);
            });

            var $metricsPanel = this.$metricsPanel;
            this.$metricsPanel.find("input").focus(function() {
                setTimeout(function() {
                    this.setSelectionRange(0, 9999);
                }.bind(this),20);
                $(this).one("blur",function() {
                    setTimeout(function() {
                        var hasFocus = false;
                        $metricsPanel.find("input").each(function() {
                            if ($(this).is(":focus")) hasFocus = true;
                        });
                        if (!hasFocus) $metricsPanel.removeClass("showPopup");
                    },50);
                });
            });

            /*
            this.$el.find(".metricsPanel input").click(function() {
                $(this).select();
            });
            util.bindClickEvent(this.$el.find(".metricsDisclosure"),_.bind(function() {
                this.$el.find(".metricsPanel").toggle();
            },this));

            //fancytize
            this.$metricsPanel.find("input").hide();
            this.$metricsPanel.find("label").click(function(e) {
                var $el = $(e.target).closest("label");
                $el.find(".labelText").hide();
                $el.find(".valueText").hide();
                $el.find("input").show().focus().one("blur",function() {
                    $el.find(".labelText").show();
                    $el.find(".valueText").show();
                    $el.find("input").hide();
                });
            }.bind(this));
            */

            this.$el.find(".metricsPanel input").change(_.bind(function() {
                this.pattern.fps = parseInt(this.$fps.val()); //TODO upgrade to float
                this.pattern.frames = parseInt(this.$frames.val())
                this.pattern.pixels = parseInt(this.$pixels.val());
                if (!this.pattern.fps || this.pattern.fps < 1) this.pattern.fps = 1;
                if (!this.pattern.frames || this.pattern.frames < 1) this.pattern.frames = 1;
                if (!this.pattern.pixels || this.pattern.pixels < 1) this.pattern.pixels = 1;

                this.updateEditor();
                this.updatePattern();
            },this));

            this.$undoButton = this.$el.find(".undoButton").click(function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.editor.undo();
            }.bind(this));
            this.$redoButton = this.$el.find(".redoButton").click(function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.editor.redo()
            }.bind(this));

            $(this.editor).on("change",_.bind(function(e) {
                this.doUpdateDelay();
            },this));

            this.$el.find(".editorcontainer").append(this.editor.$el);
            setTimeout(_.bind(function() {
                this.editor.resizeToParent();
            },this),50);

            this.$fps = this.$el.find(".metricsPanel .fps");
            this.$frames = this.$el.find(".metricsPanel .frames");
            this.$pixels = this.$el.find(".metricsPanel .pixels");
            this.updateEditor();

            this.pattern.body = util.canvasToBytes(this.canvas);
            this.updateRendered();
        },
        togglePreviewButton:function(enabled) {
            this.$el.find(".previewPatternButton").toggleClass("disabled",!enabled);
        },
        loadPattern:function(pattern) {
            this.pattern = pattern;

            this.canvas = util.renderPattern(this.pattern.pixelData,this.pattern.pixels,this.pattern.frames,null,null,false,false);
            this.editor.setImage(this.canvas);
            this.editor.setFps(this.pattern.fps);

            this.updateEditor();
            this.updatePattern();
        },
        updateHistoryButtons:function() {
            var historyState = this.editor.getHistoryButtonState()
            this.$undoButton.prop("disabled",!historyState[0]);
            this.$redoButton.prop("disabled",!historyState[1]);
        },
        updateEditor:function() {
            this.$frames.val(this.pattern.frames);
            this.$pixels.val(this.pattern.pixels);
            this.$fps.val(this.pattern.fps);

            this.$metricsPanel.find(".fps_value").text(this.pattern.fps);
            this.$metricsPanel.find(".frames_value").text(this.pattern.frames);
            this.$metricsPanel.find(".pixels_value").text(this.pattern.pixels);

            this.editor.setFps(this.pattern.fps);
            this.editor.setCanvasSize(this.pattern.pixels,this.pattern.frames);

            if (platform == "mobile") {
                this.$el.find(".metricsDisclosure .frames").text(this.pattern.frames);
                this.$el.find(".metricsDisclosure .pixels").text(this.pattern.pixels);
                this.$el.find(".metricsDisclosure .fps").text(this.pattern.fps);
            }
        },
        savePatternClicked:function() {
            this.updatePattern();
            $(this).trigger("Save",this.pattern);
        },
        updatePattern:function() {
            this.updateHistoryButtons();

            this.pattern.pixelData = util.canvasToBytes(this.canvas,false);
            $(this).trigger("PatternUpdated",[this.pattern]);
            this.updateRendered();
        },
        updateRendered:function() {
            this.stripRenderer.setPattern(this.pattern);
        },
        doUpdateDelay:function() {
            if (this.updateDelay) clearTimeout(this.updateDelay);
            this.updateDelay = setTimeout(_.bind(this.updatePattern,this),500);
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
            return this;
        },

        destroy:function() {
            if (this.stripRenderer) this.stripRenderer.destroy();
        },

        hide:function() {
            if (platform == "desktop") {
                this.$el.modal('hide');
                this.$el.remove();
            } else if (platform == "mobile") {
                setInterval(_.bind(function() { //delay until the animation finishes
                    this.$el.remove();
                },this),500);
            }
            this.destroy();
        }
    });

    return This;
});
