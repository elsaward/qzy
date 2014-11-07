require.config({
    baseUrl: 'scripts/lib'
});

require(['jquery', 'common', 'magazine'], function($, common, magazine) {
    var id = common.getUrlParameter("id");
    setTimeout(function() {magazine(id || 1);}, 500);
});