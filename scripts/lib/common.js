define(['jquery'], function ($) {
    $.ajaxSetup({
        type: "post",
        timeout: 240000,
        error: function () {
            alert("连接超时");
        }
    });

    //加载下拉框
    $.selectListLoad = function (option) {
        /*
         * selectObj     下拉框
         * url           ajax参数
         * type          post/get
         * data          ajax参数
         * htmlName      html的字段名
         * valueName     value的字段名
         * initialValue   初始默认选择
         * presentData   现成数据
         * callback      回调方法
         * titleName     列表第一项
         *
         * */
        var obj = option["selectObj"], str, item, i, len;
        $.clearDomElement(obj);

        var firstItem = option["titleName"];

        if (firstItem != undefined) {
            if(firstItem instanceof Array && firstItem.length == 2) {
                $(obj).append("<option value='" + firstItem[0] + "'>" + firstItem[1] + "</option>");
            } else if(typeof firstItem == "string") {
                $(obj).append("<option value=''>" + firstItem + "</option>");
            }
        }

        if (option["presentData"] == undefined) {
            var searchOption = {
                url: option["url"],
                type: option["type"] || "post",
                data: option["data"],
                success: function (data) {
                    var item, i, len;
                    str = "";
                    if(!data["InfoList"]) return false;
                    for (i = 0, len = data["InfoList"].length; i < len; i++) {
                        item = data["InfoList"][i];
                        str += "<option";
                        if (option["valueName"]) {
                            str += " value=" + item[option["valueName"]];
                        }
                        if (typeof (option["htmlName"]) == "function") {
                            str += ">" + option["htmlName"](item) + "</option>";
                        } else if (option["htmlName"] == undefined) {
                            str += "></option>";
                        } else {
                            str += ">" + item[option["htmlName"]] + "</option>";
                        }
                    }
                    $(obj).append(str);
                    if (option["initialValue"]) {
                        $(obj).val(option["initialValue"]);
                    }
                    if (typeof option["callback"] == "function") {
                        option["callback"](data["InfoList"], option["selectObj"]);
                    }
                }
            };
            $.ajax(searchOption);
        } else {
            str = "";
            for (i = 0, len = option["presentData"].length; i < len; i++) {
                item = option["presentData"][i];
                str += "<option";
                if (option["valueName"]) {
                    str += " value=" + item[option["valueName"]];
                }
                if (typeof (option["htmlName"]) == "function") {
                    str += ">" + option["htmlName"](item) + "</option>";
                } else if (option["htmlName"] == undefined) {
                    str += "></option>";
                } else {
                    str += ">" + item[option["htmlName"]] + "</option>";
                }
            }
            $(obj).append(str);
            if (option["initialValue"]) {
                $(obj).val(option["initialValue"]);
            }
        }

    };

    //清空DOM
    $.clearDomElement = function (obj) {
        $("*", obj).each(function () {
            $.event.remove(this);
            $.removeData(this);
        });
        $(obj).html("");
    };

    //向父框架发送数据
    $(".get-top-note").on("click", function(e) {
        var userCode = this.innerHTML || this.value;
        if(!userCode) return false;
        window.top.postMessage("note,"+userCode, '*');
        stopDefault(e);
    });

    //本地存储
    var UserData = {
        userData : null,
        name : location.hostname,
        isIE : !window.localStorage,
        init : function(){
            if (UserData.isIE && !UserData.userData) {
                try {
                    UserData.userData = document.createElement('INPUT');
                    UserData.userData.type = "hidden";
                    UserData.userData.style.display = "none";
                    UserData.userData.addBehavior ("#default#userData");
                    document.body.appendChild(UserData.userData);
                    var expires = new Date();
                    expires.setDate(expires.getDate()+365);
                    UserData.userData.expires = expires.toUTCString();
                } catch(e) {
                    return false;
                }
            }
            return true;
        },
        setItem : function(key, value) {
            if(UserData.init()){
                if(UserData.isIE) {
                    UserData.userData.load(UserData.name);
                    UserData.userData.setAttribute(key, value);
                    UserData.userData.save(UserData.name);
                } else {
                    localStorage.setItem(key, value);
                }
            }
        },
        getItem : function(key) {
            if(UserData.init()){
                if(UserData.isIE) {
                    UserData.userData.load(UserData.name);
                    return UserData.userData.getAttribute(key);
                } else {
                    return localStorage.getItem(key);
                }
            }
            return null;
        },
        existItem : function(key) {
            if(UserData.init()) {
                return !(UserData.getItem(key) == undefined || UserData.getItem(key) == null);
            }
            return false;
        },
        removeItem : function(key) {
            if(UserData.init()){
                if(UserData.isIE) {
                    UserData.userData.load(UserData.name);
                    UserData.userData.removeAttribute(key);
                    UserData.userData.save(UserData.name);
                } else {
                    localStorage.removeItem(key);
                }

            }
        }
    };

    function stopDefault(e) {
        if (e && e.preventDefault) {
            e.preventDefault();
        } else {
            window.event.returnValue = false;
        }
    }

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
        stopDefault: stopDefault,
        getUrlParameter: getUrlParameter,
        setUrlParameter: setUrlParameter,
        url2Obj: url2Obj,
        url2Arr: url2Arr,
        userData: UserData
    }
});