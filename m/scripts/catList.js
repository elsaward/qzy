require.config({
    baseUrl: 'scripts/lib'
});

require(['jquery', 'common', 'magazine'], function($, common, magazine) {
    if(!window.localStorage) {
        alert("请使用ie9以上浏览器");
        history.back();
    }

    var id = common.getUrlParameter("id");
    magazine(id || 1);

    setTimeout(function() {
        $("header").addClass("h-f-close");
        $("footer").addClass("h-f-close");
    }, 1000);

    $(".page").on("click", function() {
        $("header").toggleClass("h-f-close");
        $("footer").toggleClass("h-f-close");
    });
});