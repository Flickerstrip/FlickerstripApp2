define(["jquery","tinycolor2","ace/ace","view/util.js","view/LEDStripRenderer.js","view/CanvasPixelEditor.js","shared/Pattern.js","text!tmpl/editPatternDialog.html","text!tmpl/editPatternDialogMobile.html"],
function($,tinycolor,ace,util,LEDStripRenderer,CanvasPixelEditor,Pattern,desktop_template,mobile_template) {
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

            $(window).on("resize",_.bind(function() {
                this.stripRenderer.resizeToParent();
                this.editor.resizeToParent();
            },this));

            this.editor = new CanvasPixelEditor(null,this.pattern.palette,this.$el.find(".currentColor"),this.$el.find(".palette"));
            $(this.editor).on("PaletteUpdated",_.bind(function(e,palette) {
                this.pattern.palette = palette;
            },this));
            

            $(this.canvas).css("border","1px solid black");

            this.canvas = util.renderPattern(this.pattern.pixelData,this.pattern.pixels,this.pattern.frames,null,null,false,false);
            this.editor.setImage(this.canvas);

            this.$el.find(".metricsPanel input").click(function() {
                $(this).select();
            });

            util.bindClickEvent(this.$el.find(".metricsDisclosure"),_.bind(function() {
                this.$el.find(".metricsPanel").toggle();
            },this));

            this.$el.find(".metricsPanel input").change(_.bind(function() {
                this.pattern.fps = parseInt(this.$fps.val()); //TODO upgeade to float
                this.pattern.frames = parseInt(this.$frames.val())
                this.pattern.pixels = parseInt(this.$pixels.val());
                if (!this.pattern.fps || this.pattern.fps < 1) this.pattern.fps = 1;
                if (!this.pattern.frames || this.pattern.frames < 1) this.pattern.frames = 1;
                if (!this.pattern.pixels || this.pattern.pixels < 1) this.pattern.pixels = 1;

                this.updateEditor();
                this.updatePattern();
            },this));

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
        updateEditor:function() {
            this.$frames.val(this.pattern.frames);
            this.$pixels.val(this.pattern.pixels);
            this.$fps.val(this.pattern.fps);
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
            /*
            if (this.pattern.type == "javascript") {
                this.pattern.body = this.editor.getValue();
            } else if (this.pattern.type == "bitmap") {
            }
            */

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

                /*
                if (this.pattern.type == "javascript") {
                    this.editor = ace.edit(this.$el.find(".editorcontainer").get(0));
                    this.editor.setValue(this.pattern.code || this.gui.clientData.defaultAdvanced);
                    this.editor.setTheme("ace/theme/monokai");
                    this.editor.getSession().setMode("ace/mode/javascript");
                    this.editor.getSession().on('change',_.bind(this.doUpdateDelay,this));
                    this.editor.gotoLine(0);
                }
                */
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
