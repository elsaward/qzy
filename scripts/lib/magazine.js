//政委专用，椰子爱政委么么哒

define(["jquery", "common"], function ($, common) {
    //animationend事件名称差异
    var VENDORS = ["Moz",'webkit','ms','O'];
    var ANIMATION_END_NAMES = {
        "Moz" : "animationend",
        "webkit" : "webkitAnimationEnd",
        "ms" : "MSAnimationEnd animationend",
        "O" : "oAnimationEnd"
    };
    var css3Prefix, ANIMATION_END_NAME;
    var mTestElement = document.createElement("div");

    for (var i = 0,l = VENDORS.length; i < l; i++) {
        css3Prefix = VENDORS[i];
        if ((css3Prefix + "Transition") in mTestElement.style) {
            break;
        }
        css3Prefix = false;
    }

    if(css3Prefix) {
        ANIMATION_END_NAME = ANIMATION_END_NAMES[css3Prefix];
    } else {
        ANIMATION_END_NAME = "animationend";
    }

    //catalog
    function Item(data) {
        this.id = data["id"];
        this.name = data["name"];
        this.url = data["url"];
        this.parent = data["parent"];
        this.order = data["suborder"];
        this.firstPage = data["firstPage"];
        this.element = document.createElement("a");
        this.subElement = document.createElement("div");
        this.init();
    }

    Item.prototype = {
        init: function() {
            var self = this;
            self.element.innerHTML = self.name;
            self.element.setAttribute("data-cat", self.id);
            self.subElement.className = "qzy-tree-sub cat-" + self.id;
            self.element.onclick = function(e) {
                e = e || window.event;
                pageController.change(self.firstPage, "goto");
                common.stopDefault(e);
            };
        }
    };

    var catData;
    var container;

    var items = [];

    function sort() {
        var i, len, j, curr, prev;
        for(i = 0, len = items.length; i < len - 1; i++) {
            for(j = 0; j < len - 1 - i; j++) {
                curr = items[j + 1];
                prev = items[j];
                if(curr["parent"] < prev["parent"]
                    || (curr["parent"] == prev["parent"] && curr["order"] < prev["order"])
                    || (curr["parent"] == prev["parent"] && curr["order"] == prev["order"] && curr["id"] < prev["id"])) {
                    items[j + 1] = prev;
                    items[j] = curr;
                }
            }
        }
    }

    function createItems() {
        var i, len;
        for(i = 0, len = catData.length; i < len; i++) {
            items.push(new Item(catData[i]));
        }
    }

    function drawCat(callback) {
        sort();
        var i, len, parentNode, item;
        for(i = 0, len = items.length; i < len; i++) {
            item = items[i];
            item.element.childNodes[0].textContent = item.name;
            if(item.parent == 0) {
                container.appendChild(item.element);
                container.appendChild(item.subElement);
            } else {
                parentNode = document.querySelector(".cat-"+item.parent);
                if(parentNode) {
                    parentNode.appendChild(item.element);
                    parentNode.appendChild(item.subElement);
                }
            }
        }
        if(typeof callback == "function") {
            callback(items);
        }
    }

    var vernier = document.querySelector(".qzy-catalog-vernier");
    var sound_nav = document.querySelector("#nav-sound");

    var catController = {
        curr: {},
        build: function(id, data, callback) {
            this.callback = callback;
            if(data instanceof Array) {
                catData = data;
            }
            container = document.querySelector("#"+id);
            container.onclick = function() {
                if(sound_nav.duration == Infinity) {
                    sound_nav.load();
                }
                else {
                    sound_nav.pause();
                    sound_nav.currentTime = 0;
                    sound_nav.play();
                }
            };
            createItems();
            drawCat(this.callback);
            return items;
        },
        change: function(cat) {
            var i, len, item;
            for(i = 0, len = items.length; i < len; i++) {
                item = items[i];
                if(item["id"] == cat) {
                    this.curr = item;
                    vernier.style.top = item.element.offsetTop - 8 + "px";
                    return false;
                }
            }
            vernier.style.top = "-20px";
        }
    };

    //page
    var currPageContainer, nextPageContainer;
    var contentContainer = $(".qzy-content");
    var pageBar = $(".qzy-page-bar");
    var prevBtn = pageBar.children().eq(0),
        nextBtn = pageBar.children().eq(1);

    $(document).on("keydown", function(e) {
        e = e || window.event;
        var key = e.keyCode || e.which;
        if(key == 37) {
            pageController.prev(prevBtn.data("page"));
        } else if(key == 39) {
            pageController.next(nextBtn.data("page"));
        }
    });

    prevBtn.on("click", function(e) {
        pageController.prev($(this).data("page"));
        common.stopDefault(e);
    });

    nextBtn.on("click", function(e) {
        pageController.next($(this).data("page"));
        common.stopDefault(e);
    });

    var imgTpl = $("#imgTpl").html();
    var fileTpl = $("#fileTpl").html();
    var linkTpl = $("#linkTpl").html();
    var pageTpl = imgTpl;

    var pageController = {
        curr: 0,
        inPageIn: false,
        inPageOut: false,
        init: function() {
            prevBtn.hide();
            var option = {
                url: "data/page"+1+".json",
                data: {
                    magazineId: magazineController.id
                },
                success: function(res){
                    if(typeof res == "string") res = $.parseJSON(res);
                    pageController.curr = res["id"];
                    if(res["article"] !== "") pageTpl = fileTpl;
                    if(res["videoLink"] !== "") {
                        pageTpl = linkTpl;
                        res = getLinkPosition(res);
                    }
                    contentContainer.children().eq(0).append(getData(res, pageTpl)).addClass("page-on");
                    prevBtn.data("page", res["prePage"]);
                    nextBtn.data("page", res["nextPage"]);
                }
            };
            $.ajax(option);
        },
        pageOut: function(type) {
            this.inPageOut = true;
            clearClass(currPageContainer);
            if(type == "prev") {
                currPageContainer.removeClass("page-on");
                this.inPageOut = false;
            } else if(type == "next") {
                currPageContainer.addClass("page-out").on(ANIMATION_END_NAME, function() {
                    currPageContainer.addClass("page-off").removeClass("page-on").removeClass("page-out");
                    pageController.inPageOut = false;
                });
            } else {
                currPageContainer.removeClass("page-on");
                currPageContainer.addClass("page-out-right").on(ANIMATION_END_NAME, function() {
                    currPageContainer.addClass("page-off").removeClass("page-out-right");
                    pageController.inPageOut = false;
                });
            }
        },
        pageIn: function(type) {
            this.inPageIn = true;
            clearClass(nextPageContainer);
            nextPageContainer.removeClass("page-off");
            if(type == "prev") {
                nextPageContainer.addClass("page-in").on(ANIMATION_END_NAME, function() {
                    nextPageContainer.removeClass("page-in").addClass("page-on");
                    pageController.inPageIn = false;
                });
            } else if(type == "next") {
                nextPageContainer.addClass("page-on");
                this.inPageIn = false;
            } else {
                nextPageContainer.addClass("page-in-right").on(ANIMATION_END_NAME, function() {
                    nextPageContainer.removeClass("page-in-right").addClass("page-on");
                    pageController.inPageIn = false;
                });
            }
        },
        change: function(page, type) {
            if(this.inPageIn || this.inPageOut) return false;
            if(!page) return false;
            if(this.curr == page) return false;
            this.curr = page;

            currPageContainer = $(".page-on");
            nextPageContainer = currPageContainer.siblings(".qzy-page");
            this.pageOut(type);
            this.pageIn(type);
            var option = {
                url: "data/page"+page+".json",
                data: {
                    page: page
                },
                success: function(res) {
                    pageTpl = imgTpl;
                    if(typeof res == "string") res = $.parseJSON(res);
                    var cat = res["catalog"];

                    $.clearDomElement(nextPageContainer[0]);
                    if(res["article"] !== "") pageTpl = fileTpl;
                    if(res["videoLink"] !== "") {
                        pageTpl = linkTpl;
                        res = getLinkPosition(res);
                    }
                    nextPageContainer.append(getData(res, pageTpl));
                    prevBtn.data("page", res["prePage"]);
                    nextBtn.data("page", res["nextPage"]);
                    res["prePage"] == 0 ? prevBtn.hide() : prevBtn.show();
                    res["nextPage"] == 0 ? nextBtn.hide() : nextBtn.show();
                    if(cat == catController.curr.id) return false;
                    else catController.change(cat);
                }
            };
            $.ajax(option);
        },
        prev: function(page) {
            if(this.inPageIn || this.inPageOut) return false;
            if(page === "0" || page === undefined) return false;
            this.change(page, "prev");
        },
        next: function(page) {
            if(this.inPageIn || this.inPageOut) return false;
            if(page === "0" || page === undefined) return false;
            this.change(page, "next");
        }
    };

    function clearClass(obj) {
        obj.removeClass("page-out")
            .removeClass("page-in")
            .removeClass("page-out-right")
            .removeClass("page-in-right");
    }

    //magazine
    var magazineController = {
        id: 1,
        init: function(id) {
            this.id = id || this.id;
            var FILE_EXT;
            if(sound_nav.canPlayType("audio/ogg") != "") FILE_EXT = ".ogg";
            else FILE_EXT = ".mp3";
            sound_nav.src = "content/sound/sound" + id + FILE_EXT;
            sound_nav.load();
            var option = {
                url: "data/catList"+id+".json",
                success: function(res) {
                    setTimeout(function(){sound_nav.load();}, 1000);
                    if(typeof res == "string") res = $.parseJSON(res);
                    catController.build("catList", res);
                    pageController.init();
                }
            };
            $.ajax(option);
        }
    };

    function getLinkPosition(data) {
        var pos;
        if(data["videoLink"]) {
            pos = data["videoLink"].split("|");
            data["top"] = pos[1] || 0;
            data["left"] = pos[2] || 0;
        }
        return data;
    }

    function getData(item, htmlCode) {
        htmlCode = htmlCode.replace(/{{([\s\S]+?)}}/g, function(match, code) {
            var codeArr = code.split("|");
            if(codeArr.length == 1) return item[""+code+""] == undefined ? "" : item[""+code+""];
            else return item[""+codeArr[0]+""] || codeArr[1];
        });
        return htmlCode;
    }

    return magazineController.init;
});