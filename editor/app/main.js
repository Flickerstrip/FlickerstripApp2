require(['jquery','shared/Pattern.js','view/EditPatternDialog.js','bootstrap'],function($,Pattern,EditPatternDialog) {
    $(document).ready(function() {

        window.platform = "desktop";
        window.isTablet = false;
        var This = function() {
            this.editPatternDialog = new EditPatternDialog(this,null);
            $(".lightworkEditor").empty().append(this.editPatternDialog.$el);
        }();
    });
});
