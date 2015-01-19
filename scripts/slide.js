/**
 * 幻灯片模块 最后更新elsa141216
 */
(function($, win, doc) {
    $.fn.slide = function(option) {
        var self = this;
        var sum = $(self).children().length;
        var defaultOption = {
            direct      :   "left",
            delay       :   "5000",
            hoverStop   :   true
        };
        var t, i = 1;
        var slideOption = $.extend({}, defaultOption, option);

        var slide;
        switch (slideOption["direct"]) {
            case "left":
                slide = slideLeft;
                slideOption["distance"] = slideOption["distance"] || $(self).children().width();
                break;
            case "up":
                slide = slideUp;
                slideOption["distance"] = slideOption["distance"] || $(self).children().height();
        }

        t = setTimeout(doSlide, slideOption["delay"]);

        if(slideOption["hoverStop"]) {
            self.on("mouseenter", function() {
                clearInterval(t);
            }).on("mouseout", function() {
                t = setTimeout(doSlide, slideOption["delay"]);
            });
        }

        function doSlide() {
            clearInterval(t);
            slide();
            t = setTimeout(doSlide, slideOption["delay"]);
        }

        function slideLeft() {
            if(i >= sum) i = 0;
            $(self).animate({marginLeft: -(slideOption["distance"]*i++) + "px"}, 300);
        }

        function slideUp() {
            if(i >= sum) i = 0;
            $(self).animate({marginTop: -(slideOption["distance"]*i++) + "px"}, 300);
        }
    };
})(jQuery, window, document);