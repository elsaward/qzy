define(['jquery'], function ($) {

    $("[rel='back']").on("click", function(e) {
        history.back();
    });

    //清空DOM
    $.clearDomElement = function (obj) {
        $("*", obj).each(function () {
            $.event.remove(this);
            $.removeData(this);
        });
        $(obj).html("");
    };

    //获取URL参数值
    function getUrlParameter(name, url) {
        var tempUrl = url != null ? url : location.href;
        tempUrl = tempUrl.replace("#", "");
        var reg = new RegExp("(^|\\?|&)" + name + "=([^&]*)(\\s|&|$)", "i");
        if (reg.test(tempUrl)) return decodeURIComponent(RegExp.$2.replace(/\+/g, " "));
        return "";
    }

    //设置URL参数
    function setUrlParameter(name, value, url) {
        var tempUrl = url != null ? url : location.href, tempParam;
        tempUrl = tempUrl.replace("#", "");
        var reg = new RegExp("(^|\\?|&)(" + name + "=[^&]*)(\\s|&|$)", "i");
        if (reg.test(tempUrl)) tempParam = RegExp.$2.replace(/\+/g, " ");
        tempUrl = tempUrl.replace(tempParam, name + "=" + value);
        return tempUrl;
    }

    function url2Obj(url) {
        var obj = {};
        var tmpUrl = url || location.href;
        var reg = new RegExp("[\\?|&]([^#&]*)=([^#&]*)", "g");
        var execArr = [], results, i, len, param;
        while (true) {
            results = reg.exec(tmpUrl);
            if (results == null) break;
            execArr.push(results);
        }
        if (execArr.length == 0) {
            return false;
        }
        for (i = 0, len = execArr.length; i < len; i++) {
            param = execArr[i];
            obj[param[1]] = decodeURIComponent(param[2]);
        }
        return obj;
    }

    function url2Arr(url) {
        var arr = [[], []];
        var tmpUrl = url || location.href;
        var reg = new RegExp("[\\?|&]([^#&]*)=([^#&]*)", "g");
        var execArr = [], results, i, len, param;
        while (true) {
            results = reg.exec(tmpUrl);
            if (results == null) break;
            execArr.push(results);
        }
        if (execArr.length == 0) {
            return false;
        }
        for (i = 0, len = execArr.length; i < len; i++) {
            param = execArr[i];
            arr[0].push(param[1]);
            arr[1].push(param[2]);
        }
        return arr;
    }

    return {
        getUrlParameter: getUrlParameter,
        setUrlParameter: setUrlParameter,
        url2Obj: url2Obj,
        url2Arr: url2Arr
    }
});