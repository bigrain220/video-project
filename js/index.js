$(document).ready(function () {
    var URL = 'https://lightmvapi.aoscdn.com';
    var u_page = 1;
    var u_per_page = 16;
    var u_charge_type = 0;
    var u_composition_type = 0;
    var u_theme_resource_type = 0;
    var u_tag_brief_name = "";
    var u_language = "zh";
    var u_api_token = "14973143,1562228154,f3163a7b78c57c1b4966478f395430f5";
    var u_theme_resolution = "";
    var u_order_field = "orderby";

    var total = 0;
    var dialog_obj = {};
    // charge_type (权限)  全部：0  免费：1  会员：2
    // composition_type (类型) 全部：0 自由模板：1  固定模板：2
    // theme_resource_type  (内容)  纯照片：1 纯视频：2  两者都有：3 全部：0
    // tag_brief_name (tag标签)
    // language (语言) 中文：zh 英文：en
    // theme_resolution (比例) 16x9 9x16 1x1 全部：""
    // order_field (排序) 最热：task_num  最新：created_at 默认：orderby

    function getTag(language, api_token) {
        $.ajax({
            type: "get",
            url: URL + "/api/theme/tags",
            data: {
                "language": language,
                "api_token": api_token
            },
            async: false,
            success: function (res) {
                // console.log(res)
                var tagList = res.data;
                for (var i = 0; i < tagList.length; i++) {
                    $(".theme-tags .theme-tags-inline").append("<span class='theme-tag' data-name='" + tagList[i].brief_name + "'>" + tagList[i].tag_name + "</span>")
                }
            }
        });
    }

    function getTaskId(theme_id, language, api_token) {
        var task_id = "";
        $.ajax({
            type: "post",
            url: URL + '/api/tasks',
            async: false,
            data: {
                api_token: api_token,
                language: language,
                version: '3',
                theme_id: theme_id
            },
            success: function (res) {
                console.log(res)
                task_id = res.data.task_id;
            }
        });
        return task_id;
    }

    function getList(page, per_page, charge_type, composition_type, theme_resource_type, tag_brief_name, language, api_token, theme_resolution, order_field) {
        var Data = {
            "tag_id": "",
            "page": page,
            "per_page": per_page,
            "charge_type": charge_type,
            "composition_type": composition_type,
            "theme_resource_type": theme_resource_type,
            "tag_brief_name": tag_brief_name,
            "language": language,
            "api_token": api_token,
            "theme_resolution": theme_resolution,
            "order_field": order_field
        }
        $.ajax({
            type: "GET",
            url: URL + "/api/themes",
            data: Data,
            async: false,
            success: function (res) {
                console.log(res, 'themes')
                if (res.status === '1') {
                    total = res.data.total;
                    var list = res.data.list;
                    for (var i = 0; i < list.length; i++) {
                        var listItem = "<li class='theme-item' data-type='dynamic'>" +
                            "<div class='bg'>" +
                            "<img src=" + list[i].cover_thumb_url + ">" + isHD(list[i].is_support_hd) +
                            "<div class='free' hidden='hidden'>免费</div>" +
                            "<video class='video-item' preload='none' onmouseenter='this.play();' onmouseleave='this.load();' muted='false' loop='loop' data-id='" + list[i].theme_id + "' poster='" + list[i].cover_url + "' src='" + list[i].low_video_url + "'>" +
                            "</video></div>" +
                            "<div class='bot'>" +
                            "<div class='front'>" +
                            "<div class='theme-name'>" + list[i].title + "</div>" +
                            "<div class='theme-time' data-layer='theme-layer' data-align='t' hidden='hidden'>" +
                            "<div class='theme-layer'>" +
                            "<div class='ap-trangle'></div>" +
                            "<h3>固定模板</h3>" +
                            "<p>此模板有固定时长和素材数，不能进行更改。</p>" +
                            "</div>00:00</div>" +
                            "<div class='theme-attr' data-layer='theme-layer'><div class='theme-layer' style='display: block; left: 0px; top: 0px;'>" +
                            "<div class='ap-trangle ap-align-top' style='left: 0px;'></div>" +
                            "<h3>自由模板</h3>" +
                            "<p>此模板允许添加4-50张照片，所需时长与照片数量有关。</p>" +
                            "</div>" + hasTime(list[i].duration) + "</div></div>" +
                            "<div class='back'><div class='use-theme' data-id=" + list[i].theme_id + " data-type=" + list[i].theme_type + ">使用" +
                            "</div></div></div></li>";
                        $('ul.theme-list').append($(listItem));
                        dialog_obj[list[i].theme_id] = list[i].statistics;
                    }
                    // console.log(dialog_obj)
                    $('.no-more').css('display', 'none');
                    $('.loading').css('display', 'none');
                } else {
                    console.log('请求失败')
                }
            }
        });
    }

    //过滤函数
    function isHD(params) {
        if (params == '1') {
            return "<div class='super-mark'>HD</div>"
        } else {
            return ""
        }
    }

    function hasTime(params) {
        if (params > 0) {
            var a = 0;
            var b = 0;
            parseInt(params / 60) > 9 ? a = parseInt(params / 60) : a = '0' + parseInt(params / 60);
            (params % 60) > 9 ? b = (params % 60) : b = '0' + (params % 60);
            return "<span class='isFreedom'>" + a + ":" + b + "</span>"
        } else if (params === 0) {
            return "<span class='isFreedom'>自由模板</span>"
        }
    }



    //初始化数据
    function initOptions() {
        $('.classify .drop-menu ul li.normal').each(function (index, element) {
            $(element).siblings().removeClass("active");
            $(element).addClass("active");
        });
        $('.classify .text-con').html('全部');
        u_theme_resource_type = 0;
        u_charge_type = 0;
        u_composition_type = 0;
        u_theme_resolution = "";
        u_order_field = "orderby";
    }

    // hover事件处理
    function hoverEvent() {
        $('.theme-list li.theme-item').hover(function () {
            // over
            $(this).find('.back').css('display', 'block');
        }, function () {
            // out
            $(this).find('.back').css('display', 'none');
        });
    }

    //点击事件处理
    $(document).on('click', function (e) {
        var event = e.target;

        //options
        if ($(event).hasClass('drop-select')) {
            $('.drop-select').removeClass('active');
            $(event).addClass('active');
            $('.drop-select').not('.active').children('.drop-menu').css('display', 'none');
            $(event).children('.drop-menu').toggle();
        } else if ($(event).hasClass('iconxiala') || $(event).hasClass('option') || $(event).hasClass('text-con')) {
            $('.drop-select').removeClass('active');
            $(event).parent().addClass('active');
            $('.drop-select').not('.active').children('.drop-menu').css('display', 'none');
            $(event).siblings('.drop-menu').toggle();
        } else {
            $('.drop-menu').css('display', 'none');
        };

        //theme-tags
        if ($(event).hasClass('theme-tag')) {
            $('.loading').css('display', 'block');
            u_page = 1;
            u_tag_brief_name = $(event).attr('data-name');
            $('ul.theme-list').html("");
            dialog_obj = {};
            var timer =null;
            clearTimeout(timer);
            timer = setTimeout(function () {
                initOptions();
                getList(u_page, u_per_page, u_charge_type, u_composition_type, u_theme_resource_type, u_tag_brief_name, u_language, u_api_token, u_theme_resolution, u_order_field);
                hoverEvent();
            }, 500)
            $(event).siblings().removeClass('active');
            $(event).addClass('active');
        }

        //close-btn
        if ($(event).hasClass('win-close')) {
            $('.win-mask').css('display', 'none');
            $(event).parent().css('display', 'none');
            $('.ratio-select .text-con.option').html('16:9 ( 横屏 )');
            $('.ratio-select .drop-menu ul li').removeClass('active');
            $('.ratio-select .drop-menu ul li').first().addClass('active');
            $('.win-body .left video').attr('src', "");
            $('.right-free').remove();
            $('.right-time').remove();
            $('.video-trigger').css('display', 'none')
        }
        //dialog
        if ($(event).hasClass('video-item') || $(event).hasClass('super-mark')) {
            $('.win-mask').css('display', 'block');
            $('.win.single-theme-win').css('display', 'block');
            $('.select .choose').attr('data-id', $(event).attr('data-id'));
            getDialog($(event))
        }

        if ($(event).hasClass('use-theme') || $(event).hasClass('choose')) {
            var u_theme_id = $(event).attr('data-id');
            location.href = "./edit.html?taskID="+getTaskId(u_theme_id, u_language, u_api_token);
        }

        if ($(event).hasClass('video-trigger') || $(event).hasClass('video-trigger-logo')) {
            $('.video-trigger').css('display', 'none');
            $(".win-body .left video").get(0).play();
        }
        //back-top
        if ($(event).hasClass('back-top')) {
            $('html,body').animate({
                'scrollTop': 0
            }, 600); //滚回顶部的时间，越小滚的速度越快~
        }
    });

    $('.drop-menu ul li').on('click', function (e) {
        var select_val = $(this).text();
        $(this).parent().parent().parent().children('.text-con').text(select_val);
        $(this).siblings().removeClass('active');
        $(this).addClass('active');
        //不是弹出框才触发
        if (!$(this).parent().hasClass('dialog-option')) {
            $('.loading').css('display', 'block');
            var tem_class = $(this).parent().attr('class');
            switch (tem_class) {
                case "theme_resource_type":
                    u_theme_resource_type = $(this).attr('data-type');
                    break;
                case "charge_type":
                    u_charge_type = $(this).attr('data-type');
                    break;
                case "composition_type":
                    u_composition_type = $(this).attr('data-type');
                    break;
                case "theme_resolution":
                    u_theme_resolution = $(this).attr('data-type');
                    break;
                case "order_field":
                    u_order_field = $(this).attr('data-type');
                    break;
                default:
                    console.log('error')
                    break;
            }
            $('ul.theme-list').html("");
            dialog_obj = {};
            u_page = 1;
            var timer =null;
            clearTimeout(timer);
            timer = setTimeout(function () {
                getList(u_page, u_per_page, u_charge_type, u_composition_type, u_theme_resource_type, u_tag_brief_name, u_language, u_api_token, u_theme_resolution, u_order_field);
            }, 500)
        }
    });

    $('.win-body .video-playing video').on('play', function () {
        $('.video-trigger').css('display', 'none');
    });
    $('.win-body .video-playing video').on('pause', function () {
        $('.video-trigger').css('display', 'block');
    });



    $(window).resize(function () {
        //  console.log($(document).width(),$(".win.single-theme-win").width())
        getLeft();
    });

    $(window).scroll(function () {
        var BOTTOM_OFFSET = 0;
        //当前窗口的高度
        var windowHeight = $(window).height();
        //当前滚动条从上往下滚动的距离
        var scrollTop = $(window).scrollTop();
        //当前文档的高度
        var docHeight = $(document).height();
        //当 滚动条距底部的距离 + 滚动条滚动的距离 >= 文档的高度 - 窗口的高度
        if ((BOTTOM_OFFSET + scrollTop) >= docHeight - windowHeight) {
            if (u_page * u_per_page < total) {
                u_page += 1;
                console.log(u_page)
                getList(u_page, u_per_page, u_charge_type, u_composition_type, u_theme_resource_type, u_tag_brief_name, u_language, u_api_token, u_theme_resolution, u_order_field);
            } else {
                console.log('nomore')
                $('.no-more').css('display', 'block');
            }
        }
        if (scrollTop > 350) {
            $('.back-top').stop().slideDown(100);
        } else {
            $('.back-top').stop().slideUp(100);
        }
    });



    //dialog定位
    function getLeft() {
        var reWidth = ($(document).width() - $(".win.single-theme-win").width()) / 2;
        $(".win.single-theme-win").css('left', reWidth)
    }

    function getDialog(params) {
        var _this = params;
        var ID = _this.attr('data-id');
        var isFreedom = _this.parent().parent().find('span.isFreedom').text();
        var themeName = _this.parent().parent().find('div.theme-name').text();
        var videoSrc = _this.attr('src')

        $('.win-body .left video').attr('src', videoSrc);
        $('.win-body .right h3').html(themeName);
        if (isFreedom === '自由模板') {
            var rightDom =
                "<div class='right-free'>" +
                "<div class='time'><span class='iconfont icontime'></span><span class='time-con'>时长不限</span></div>" +
                "<div class='tip support sup1'><span class='iconfont iconwrite'></span><span>支持照片/视频/文本</span></div>" +
                "</div>"
            $('.win-body .right h3').after(rightDom);
        } else {
            var rightDom2 =
                "<div class='right-time'>" +
                "<div class='time'><span class='iconfont icontime'></span><span class='time-con'>" + isFreedom + "</span></div>" +
                "<div class='tip image'><span class='iconfont iconpic'></span><span class='image-con'>" + dialog_obj[ID].image + "张照片</span></div>" +
                "<div class='tip video'><span class='iconfont iconaddvedio'></span><span class='video-con'>" + dialog_obj[ID].video + "个视频</span></div>" +
                "<div class='tip tip-text'><span class='iconfont icontubiao_huabanfuben'></span><span class='text-con'>" + dialog_obj[ID].text + "处文字</span></div>" +
                "</div>"
            $('.win-body .right h3').after(rightDom2);
        }
    }

    //  初始化
    getLeft();
    getTag(u_language, u_api_token);
    getList(u_page, u_per_page, u_charge_type, u_composition_type, u_theme_resource_type, u_tag_brief_name, u_language, u_api_token, u_theme_resolution, u_order_field);
    hoverEvent();
});