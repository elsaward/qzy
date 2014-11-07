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

    //topMenu
    var switcher = document.querySelector(".qzy-nav-switcher");
    var topMenu = document.querySelector(".qzy-top-menu-small");
    switcher.onclick = function() {
        if(topMenu.style.display == "block") {
            topMenu.style.display = "none";
            switcher.innerHTML = "打开菜单";
        } else {
            topMenu.style.display = "block";
            switcher.innerHTML = "关闭菜单";
        }
    };

    //catalog
    function Item(data) {
        this.id = data["id"];
        this.name = data["name"];
        this.url = data["url"];
        this.parent = data["parent"];
        this.order = data["order"];
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

    //sound_nav.load();

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
            pageController.prev();
        } else if(key == 39) {
            pageController.next();
        }
    });

    prevBtn.on("click", function(e) {
        pageController.prev();
        common.stopDefault(e);
    });

    nextBtn.on("click", function(e) {
        pageController.next();
        common.stopDefault(e);
    });

    var pageController = {
        curr: null,
        max: null,
        inPageIn: false,
        inPageOut: false,
        init: function() {
            this.curr = 1;
            prevBtn.hide();
            var option = {
                url: "data/page"+1+".json",
                data: {
                    page: 1,
                    magazineId: magazineController.id
                },
                success: function(res){
                    if(typeof res == "string") res = $.parseJSON(res);
                    pageController.max = 10;
                    contentContainer.children().eq(0).append(res["data"]).addClass("page-on");
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
            if(this.curr == page && type == "goto") return false;
            if(page > this.max || page < 1) page = 1;
            this.curr = page;
            this.curr == 1 ? prevBtn.hide() : prevBtn.show();
            this.curr == this.max ? nextBtn.hide() : nextBtn.show();
            currPageContainer = $(".page-on");
            nextPageContainer = currPageContainer.siblings(".qzy-page");
            this.pageOut(type);
            this.pageIn(type);
            var option = {
                url: "data/page"+page+".json",
                data: {
                    page: page,
                    magazineId: magazineController.id
                },
                success: function(res) {
                    if(typeof res == "string") res = $.parseJSON(res);
                    var cat = res["catalog"];
                    $.clearDomElement(nextPageContainer[0]);
                    nextPageContainer.append(res["data"]);
                    if(cat == catController.curr.id) return false;
                    else catController.change(cat);
                }
            };
            $.ajax(option);
        },
        prev: function() {
            if(this.inPageIn || this.inPageOut) return false;
            this.curr--;
            if(this.curr < 1) {
                this.curr = 1;
                return false;
            }
            this.change(this.curr, "prev");
        },
        next: function() {
            if(this.inPageIn || this.inPageOut) return false;
            this.curr++;
            if(this.curr > this.max) {
                this.curr = this.max;
                return false;
            }
            this.change(this.curr, "next");
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
        id: null,
        init: function(id) {
            this.id = id;
            var FILE_EXT;
            if(sound_nav.canPlayType("audio/ogg") == "probably") FILE_EXT = ".ogg";
            else FILE_EXT = ".mp3";
            sound_nav.src = "content/sound/sound" + id + FILE_EXT;
            sound_nav.load();
            var option = {
                url: "data/catList"+id+".json",
                success: function(res) {
                    if(typeof res == "string") res = $.parseJSON(res);
                    catController.build("catList", res);
                    pageController.init();
                }
            };
            $.ajax(option);
        }
    };

    return magazineController.init;
});