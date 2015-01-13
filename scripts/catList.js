require.config({
    baseUrl: 'scripts/lib'
});

require(['jquery', 'common', 'magazine'], function($, common, magazine) {
    if(!window.localStorage) {
        alert("请使用ie9以上浏览器");
        history.back();
    }

    var id = common.getUrlParameter("id");
    setTimeout(function() {magazine(id || 1);}, 500);

    window.onresize = function() {
        location.reload();
    }
});