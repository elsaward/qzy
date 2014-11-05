require.config({
    baseUrl: 'scripts/lib'
});

require(['jquery', 'common', 'magazine'], function($, common, magazine) {
    setTimeout(function() {magazine(1);}, 1000);
});