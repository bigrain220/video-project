$(document).ready(function () {
    var URL = 'https://lightmvapi.aoscdn.com';
    var u_task_id = location.href.split("taskID=")[1];
    var u_language = 'zh';
    var u_api_token = '14973143,1562228154,f3163a7b78c57c1b4966478f395430f5';
    var u_project_file = "";

    var themeData = "";
    var projectData = "";
    var resourcesData = "";
    var ossData = ""

    var delete_music_item = ""; //临时jq对象
    var reset_index = "";

    // 初始化
    getLeft();
    getData(u_language, u_api_token);
    getLeftDom();
    getImgTextList();
    scenesClick();
    getMusic();

    function getData(language, api_token) {
        $.ajax({
            type: "GET",
            url: URL + "/api/tasks/" + u_task_id,
            data: {
                "language": language,
                "version": '3',
                "api_token": api_token
            },
            async: false,
            success: function (res) {
                console.log(res)
                if (res.status === '1') {
                    $(".video-title .title>span").first().text(res.data.title);
                    themeData = res.data.theme;
                    projectData = res.data.project_file;
                    resourcesData = res.data.resources;
                    u_project_file = $.extend(true, {}, projectData)

                } else {
                    console.log('请求失败')
                }
            }
        });
    }


    function changeTitle(language, api_token, title) {
        $.ajax({
            type: "PUT",
            url: URL + "/api/tasks/" + u_task_id,
            data: {
                "language": language,
                "version": '3',
                "api_token": api_token,
                "title": title
            },
            success: function (res) {
                if (res.status == '1') {
                    $('.video-title .title span').first().text(title);
                }
            }
        });
    }

    function changeProject(language, api_token, project_file) {
        $.ajax({
            type: "PUT",
            url: URL + "/api/tasks/" + u_task_id,
            data: {
                "language": language,
                "version": '3',
                "api_token": api_token,
                "project_file": JSON.stringify(project_file)
            },
            success: function (res) {
                if (res.status == '1') {
                    console.log(res)
                }
            }
        });
    }



    function getMusic() {
        //music 
        $(".recommend-music ul").html('');
        $('.my-music ul li').remove();
        var global = resourcesData.userself.global;
        var existMusic = false;
        for (var j = 0; j < global.length; j++) {
            var musicLiLeft =
                "<li class='music-item' data-url='" + global[j].audio_url + "' data-duration='" + global[j].duration + "' data-id='" + global[j].resource_id + "' data-title='" + global[j].filename + "'>" +
                "<div class='music-bg'>" +
                // "<span class='process-num'><span class='num'>0</span>%</span>" +
                "<div class='button'>" +
                "<div class='button-left'><span class='music-play iconfont iconplay'></span><span class='delete iconfont icondelete delete-music'></span></div>" +
                "<div class='button-right'>" +
                "<span class='duration'>" + hasTime(global[j].duration) + "</span>" +
                "</div>" +
                "</div>" +
                "<div class='iconfont iconmusic1 music-bck'></div>" +
                "</div>" +
                "<div class='title'>" + global[j].filename + "</div>" +
                "<div class='checked-icon'><span class='iconfont iconicon-test'></span></div>" +
                "</li>"
            $("ul .add-music").before(musicLiLeft);
            if (global[j].resource_id == projectData.attrs.audio.value) {
                existMusic = true
            }
        }
        var musicLiRight =
            "<li class='music-item' data-url='" + projectData.attrs.default_audio.url + "' data-id='default'>" +
            "<div class='music-bg'>" +
            "<div class='button'>" +
            "<div class='button-left'><span class='music-play iconfont iconplay'></span></div>" +
            "<div class='button-right'>" +
            "<span class='duration'>" + hasTime(projectData.attrs.default_audio.duration) + "</span>" +
            "</div>" +
            "</div><div class='iconfont iconmusic1 music-bck'></div>" +
            "</div>" +
            "<div class='title'>默认</div>" +
            "<div class='checked-icon'><span class='iconfont iconicon-test'></span></div>"
        "</li>"
        $(".recommend-music ul").append(musicLiRight);
        if (projectData.attrs.audio.value === "" || existMusic == false) {
            $("li.music-item").removeClass('checked');
            $("li.music-item[data-id='default']").addClass('checked');
        } else {
            $("li.music-item").removeClass('checked');
            $("li.music-item[data-id='" + projectData.attrs.audio.value + "']").addClass('checked');
        }

        getMusiclogo();

        $('.recommend-select li').removeClass('active');
        $('.recommend-select li.mine').addClass('active');
        $('.my-music').show();
        $('.recommend-music').hide();
        //切换音乐
        $('li.music-item').on('click', function (e) {
            if (!$(e.target).hasClass('music-play') && !$(e.target).hasClass('delete-music')) {
                $('li.music-item').removeClass('checked');
                $(this).addClass('checked');
                u_project_file.attrs.audio.value = $(this).attr('data-id');
                u_project_file.attrs.audio.filename = $(this).attr('data-title');
                if ($(this).attr('data-id') == 'default') {
                    u_project_file.attrs.audio.value = "";
                    delete u_project_file.attrs.audio['filename'];
                }
            }

        });
    }

    function deleteMusic(language, api_token, e) {
        var ids = "[\"" + e.parents('.music-item').attr('data-id') + "\"]";
        $.ajax({
            type: "DELETE",
            url: URL + "/api/tasks/" + u_task_id + '/resources/',
            data: {
                "language": language,
                "version": '3',
                "api_token": api_token,
                "ids": ids
            },
            success: function (res) {
                if (res.status == 1) {
                    getData(u_language, u_api_token);
                    getMusic();
                }
            }
        });
    }

    function getLeftDom() {
        $(".cover.theme-dialog").css("backgroundImage", "url(" + themeData.cover_url + ")")
        $('.edit-wrap-info .theme-name span').first().text(themeData.title)
        //left 数量限制
        var unit_num = 0;
        for (var i = 0; i < projectData.scenes.length; i++) {
            if (projectData.scenes[i].is_fixed_unit_num == '0') {
                var quickDom = "<i class='iconfont iconpic'><span style='margin:0 5px;'>" + projectData.scenes[i].min_unit_num + "</span>" + '- ' + projectData.scenes[i].max_unit_num;
                $('.scene-num.quick-num').append(quickDom);
                var expectDom = "<div class='expect'><span>预估时长</span>:<span class='estimate-time'>  00:00</span></div>";
                $('.scene-num.quick-num').after(expectDom);
                break;
            } else {
                unit_num += 1;
                if (unit_num === projectData.scenes.length - 1) {
                    if (themeData.statistics.image > 0) {
                        var quickDom = "<i class='iconfont iconpic' style='margin-right: 5px;'></i><span style='margin-right: 15px;'>" + themeData.statistics.image + "</span>"
                        $('.scene-num.quick-num').append(quickDom);
                    }
                    if (themeData.statistics.video > 0) {
                        var quickDom = "<i class='iconfont iconaddvedio' style='margin-right: 5px;font-size:22px;line-height:22px;'></i><span style='margin-right: 15px;'>" + themeData.statistics.video + "</span>"
                        $('.scene-num.quick-num').append(quickDom);
                    }
                    var expectDom = "<div class='process'>" +
                        "<span>进度</span>:<span class='process-bar-bg'><span class='process-bar' style='width:0%;'></span></span>" +
                        "<span class='process-num'><span>0</span>/<span>" + themeData.statistics.image + "</span></span></div>";
                    $('.scene-num.quick-num').after(expectDom);
                }
            }
        }
    }

    function getResource(language, api_token, task_id) {
        $.ajax({
            type: "GET",
            url: URL + "/api/authentications/",
            async: false,
            data: {
                "language": language,
                "version": '3',
                "api_token": api_token,
                "task_id": task_id,
            },
            success: function (res) {
                console.log('resource', res);
                ossData = res.data;
                console.log(ossData)

            }
        });
    }


    //点击事件处理
    $(document).on('click', function (e) {
        var event = e.target;

        //theme-dialog
        if ($(event).hasClass('theme-dialog')) {
            $('.win-mask').css('display', 'block');
            $('.win.single-theme-win').css('display', 'block');
            getThemeDialog();
        }


        if ($(event).hasClass('video-trigger') || $(event).hasClass('video-trigger-logo')) {
            $('.video-trigger').css('display', 'none');
            $(".single-theme-win .left video").get(0).play();
        }

        //close-btn
        if ($(event).hasClass('win-close')) {
            if ($(event).hasClass('win-confirm-close')) {
                $('.win-mask').css('zIndex', '901');
            } else {
                $('.win-mask').css('display', 'none');
            }
            $(event).parent().css('display', 'none');
            if ($(event).parent().hasClass('single-theme-win')) {
                $('.single-theme-win .left video').attr('src', "");
                $('.single-theme-win .right-free').remove();
                $('.single-theme-win .right-time').remove();
                $('.single-theme-win .video-trigger').css('display', 'none')
            } else if ($(event).parent().hasClass('upload-music-win')) {
                $('.upload-music-win audio').get(0).load();
                $(".upload-music-win .music-play").removeClass('iconpause');
                $(".upload-music-win .music-play").addClass('iconplay');
                $('.recommend-select li').removeClass('active');
                $('.recommend-select li.mine').addClass('active');
                $('.my-music').show();
                $('.recommend-music').hide();
            }

        }

        //size-options
        if ($(event).hasClass('drop-select')) {
            $(event).children('.drop-menu').toggle();
        } else if ($(event).hasClass('iconxiala') || $(event).hasClass('text-con')) {
            $(event).siblings('.drop-menu').toggle();
        } else {
            $('.drop-menu').css('display', 'none');
        };

        if ($(event).hasClass('size-option')) {
            var select_val = $(event).text();
            $(event).parent().parent().parent().children('.text-con').text(select_val);
            $(event).siblings().removeClass('active');
            $(event).addClass('active');
        }

        // music-dialog
        if ($(event).hasClass('crop-music')) {
            $('.upload-music-win').css('display', 'flex');
            $('.win-mask').css('display', 'block');
            getData(u_language, u_api_token);
            getMusic();
        }

        if ($(event).hasClass('music-option')) {
            $(".music-option").removeClass("active");
            $(event).addClass('active');
            if ($(event).hasClass('mine')) {
                $('.my-music').show();
                $('.recommend-music').hide();
            } else {
                $('.my-music').hide();
                $('.recommend-music').show();
            }
        }

        if ($(event).hasClass('music-play')) {
            var musicAttr = $(event).parents(".music-item");
            $('.upload-music-win audio').attr('src', musicAttr.attr('data-url'));
            $(event).parents(".music-item").siblings().find('.iconpause').addClass('iconplay');
            $(event).parents(".music-item").siblings().find('.iconpause').removeClass('iconpause');
            if ($(event).hasClass('iconplay')) {
                $(event).removeClass('iconplay');
                $(event).addClass('iconpause');
                $('.upload-music-win audio').get(0).play();
            } else {
                $(event).removeClass('iconpause');
                $(event).addClass('iconplay');
                $('.upload-music-win audio').get(0).load();
            }
        }

        //change-title
        if ($(event).hasClass('title-ok')) {
            var c_title = $(event).siblings('input').val();
            changeTitle(u_language, u_api_token, c_title);
            $(event).parent().removeClass('active');
            $(event).parent().siblings().css('display', 'flex');
        } else if ($(event).hasClass('title-cancel')) {
            $(event).parent().removeClass('active');
            $(event).parent().siblings().css('display', 'flex');
        }

        //delete-music
        if ($(event).hasClass('delete-music')) {
            $('.win.msg-confirm').css('display', 'flex');
            $('.win-mask').css({
                'display': 'block',
                'zIndex': '1100'
            });
            delete_music_item = $(event);
        }
        if ($(event).attr('type') === 'cancel') {
            $('.win.msg-confirm').css('display', 'none');
            $('.win-mask').css('zIndex', '901');
        } else if ($(event).attr('type') === 'primary') {
            $('.win.msg-confirm').css('display', 'none');
            $('.win-mask').css('zIndex', '901');
            deleteMusic(u_language, u_api_token, delete_music_item);
        }

        //确认音乐
        if ($(event).hasClass('music-ok')) {
            $('.win-mask').css('display', 'none');
            $('.upload-music-win audio').get(0).load();
            $(".upload-music-win .music-play").removeClass('iconpause');
            $(".upload-music-win .music-play").addClass('iconplay');
            $(event).parent().parent().css('display', 'none');
            changeProject(u_language, u_api_token, u_project_file);
            getMusiclogo();
        }

    })
    //修改标题
    $('.video-title .title').on('click', function () {
        $(this).css('display', 'none');
        $(this).siblings(".input-wrap").addClass('active');
        var pre_title = $(this).children('span').text();
        $('.video-title .input-wrap input').val(pre_title);
    });



    $(window).resize(function () {
        getLeft();
    });

    $('.single-theme-win .video-playing video').on('play', function () {
        $('.video-trigger').css('display', 'none');
    });
    $('.single-theme-win .video-playing video').on('pause', function () {
        $('.video-trigger').css('display', 'block');
    });

    $('textarea.te-input').bind('input propertychange keyup', function () {
        var curr = $(this).val().length;
        $('.te-limit .num').text(curr.toString());
    });


    $('#uploadMusic').change(function (e) {
        e.preventDefault();
        getResource(u_language, u_api_token, u_task_id);
        var f = e.target.files[0];
        var val = e.target.value;
        var suffix = val.substr(val.indexOf("."));
        var obj = new Date().getTime(); // 这里是生成文件名
        var storeAs = ossData.oss.folder + obj + suffix; //命名空间
        //callback
        var url = ossData['callback']['callbackUrl'];
        var callbackBody = ossData['callback']['callbackBody'];
        var userargs = "x:uid=" + '14973143' + "&x:utoken=" + encodeURI('f737cffbf1a96349d71b73951413216b') + "&x:original_name=" + encodeURI(f.name.toLowerCase()) + "&x:task_id=" + u_task_id;
        var callback = {
            "callbackUrl": url,
            "callbackBody": callbackBody + userargs,
        }

        var client = new OSS.Wrapper({
            'region': ossData.oss.region,
            'accessKeyId': ossData.oss.access_id,
            'accessKeySecret': ossData.oss.access_secret,
            'bucket': ossData.oss.bucket,
            'stsToken': ossData.oss.security_token
        });
        musicLoading();
        var progress = function (p) {
            return function (done) {
                if (p == 1) {
                    $('.music-item span.num').text('99');
                    clearTimeout(timer);
                    var timer = setTimeout(function () {
                        $('.music-item span.num').text('100');
                    }, 5000);
                } else {
                    $('.music-item span.num').text(Math.floor(p * 100));
                }
                done();
            }
        };

        function musicLoading() {
            var musicLoadingDom =
                "<li class='music-item process-li'>" +
                "<div class='music-bg'>" +
                "<div class='process-num'><span class='num'>0</span>%</div>" +
                "<div class='iconfont iconmusic1 music-bck'></div>" +
                "</div>" +
                "<div class='title'>" + f.name + "</div>" +
                "</li>"
            $('.my-music .add-music').before(musicLoadingDom);
        }

        function parse(data) {
            var b = new Base64();
            var tem = JSON.stringify(data);
            var dataBase64 = b.encode(tem);
            return dataBase64;
        }


        client.multipartUpload(storeAs, f, {
            progress: progress,
            headers: {
                "x-oss-callback": parse(callback)
            }
        }).then(function (result) {
            console.log(result); //返回对象
            clearTimeout(timer);
            var timer = setTimeout(function () {
                getData(u_language, u_api_token);
                getMusic();
            }, 5000);
        }).catch(function (err) {
            console.log(err);
        });

    });



    function getThemeDialog() {
        var Duration = themeData.duration;
        $('.single-theme-win .left video').attr('src', themeData.video_url);
        $('.single-theme-win .right h3').html(themeData.title);
        if (Duration == '0') {
            var rightDom =
                "<div class='right-free'>" +
                "<div class='time'><span class='iconfont icontime'></span><span class='time-con'>时长不限</span></div>" +
                "<div class='tip support sup1'><span class='iconfont iconwrite'></span><span>支持照片/视频/文本</span></div>" +
                "</div>"
            $('.single-theme-win .right h3').after(rightDom);
        } else {
            var rightDom2 =
                "<div class='right-time'>" +
                "<div class='time'><span class='iconfont icontime'></span><span class='time-con'>" + hasTime(Duration) + "</span></div>" +
                "<div class='tip image'><span class='iconfont iconpic'></span><span class='image-con'>" + themeData.statistics.image + "张照片</span></div>" +
                "<div class='tip video'><span class='iconfont iconaddvedio'></span><span class='video-con'>" + themeData.statistics.video + "个视频</span></div>" +
                "<div class='tip tip-text'><span class='iconfont icontubiao_huabanfuben'></span><span class='text-con'>" + themeData.statistics.text + "处文字</span></div>" +
                "</div>"
            $('.single-theme-win .right h3').after(rightDom2);
        }
    }
    //dialog定位
    function getLeft() {
        var positionArr = ['.win.single-theme-win', '.win.change-text-win', '.win.msg-confirm', '.win.upload-music-win']
        for (var i = 0; i < positionArr.length; i++) {
            var reWidth = ($(document).width() - $(positionArr[i]).width()) / 2;
            $(positionArr[i]).css('left', reWidth);
            var reHeight = ($(document).height() - $(positionArr[i]).height()) / 2;
            $(positionArr[i]).css('top', reHeight);
        }


    }
    //处理数据
    function hasTime(params) {
        if (params > 0) {
            var a = 0;
            var b = 0;
            parseInt(params / 60) > 9 ? a = parseInt(params / 60) : a = '0' + parseInt(params / 60);
            (params % 60) > 9 ? b = (params % 60) : b = '0' + (params % 60);
            return a + ":" + b
        } else if (params == 0) {
            return '00:00'
        }
    }

    //音乐左侧介绍
    function getMusiclogo() {
        var time = $('.music-item.checked').attr('data-duration');
        time ? time = hasTime(time) : time = hasTime(projectData.attrs.default_audio.duration)
        var name = $('.music-item.checked>.title').text();
        $('.edit-wrap-music .change-music-btn .bottom').text(time);
        $('.edit-wrap-music .change-music-btn .top').text(name);
    }
    //图片文字渲染
    function getImgTextList() {
        var Duration = themeData.duration;
        //自由模板
        if (Duration == '0') {
            $('.simple-edit').show();
            $('.super-edit').hide();
            //head
            var units0 = projectData.scenes[0].units;
            $('.scenes .scenes-head span').last().html(getTrueVal(units0[0]));
            $('.opening  .replace-matter.replace-text').eq(0).attr({
                'data-url': units0[0].preview_url, 'data-text': getTrueVal(units0[0]),
                'data-limit': setlimit(units0[0]), 'data-scene': '0', 'data-unit': '0'
            });

            //center
            var units1 = projectData.scenes[1].units;
            for (var i = 0; i < units1.length; i++) {
                var imgListDom =
                    "<li  class='replace-matter replace-li replace-text'" +
                    "data-type='" + units1[i].type + "' data-limit='" + "60" + "' data-url='" + valToImg(units1[i], 'big') + "' data-text='" + setText(units1[i]) + "' >" +
                    "<div class='bg'>" +
                    imgOrtext(units1[i], 'simple') +
                    "</div>" +
                    "<div class='process' style='display: block;' hidden='hidden'>" +
                    "<div class='process-bar-bg'><div class='process-bar' style='width: 99%;'></div></div>" +
                    "<div class='process-text'><span class='process-text-retry'>重新上传</span></div>" +
                    "</div>" +
                    "</div>" +
                    "<div class='button clearfix'>" +
                    "<div class='change-text dynamic iconfont icontext'></div><div class='remove iconfont iconyichu'></div>" +
                    "</div></li>"
                $(".scenes-wrap .upload-btn").before(imgListDom);

            }
            //bottom
            var units2 = projectData.scenes[2].units;
            $('.scenes .scenes-bottom span').last().html(getTrueVal(units2[0]));
            $('.ending  .replace-matter.replace-text').eq(0).attr({
                'data-url': units2[0].preview_url, 'data-text': getTrueVal(units2[0]),
                'data-limit': setlimit(units2[0]), 'data-scene': '2', 'data-unit': '0'
            });

        } else {
            //固定模板
            $('.simple-edit').hide();
            $('.super-edit').show();
            $('.top-control').css('display', 'none');
            var surperScenes = projectData.scenes;
            for (var i = 0; i < surperScenes.length; i++) {
                var surperScenesBox =
                    "<li class='scene-line'>" +
                    "<div class='default-title'><span>场景</span>" + (i + 1) + "</div>" +
                    "<ul class='num_" + i + "'></ul></li>"
                $('.super-edit .scenes>ul').append(surperScenesBox);
                for (var j = 0; j < surperScenes[i].units.length; j++) {
                    var superHeadList =
                        "<li data-scene='" + i + "' data-unit='" + j + "' class='replace-matter replace-text need-replace' data-type='" + surperScenes[i].units[j].type + "' draggable='false'" + "data-limit='" + setlimit(surperScenes[i].units[j]) +
                        "' data-url='" + surperScenes[i].units[j].preview_url + "' data-text='" + getTrueVal(surperScenes[i].units[j]) + "'>" +
                        "<div class='bg'>" +
                        imgOrtext(surperScenes[i].units[j], 'super') +
                        "</div>" +
                        "<div class='button'>" +
                        "<div class='duration' hidden='hidden'>undefineds</div>" +
                        "<div class='edit iconfont iconwrite'></div><div class='remove iconfont iconyichu' hidden='hidden'></div>" +
                        "<div class='eye' data-align='tr' data-gap='30 0' data-layer='img-layer'>" +
                        "<span class='iconfont iconGroup'></span>" +
                        "<div class='img-layer' style='display: block; left: -110px; top: -96px;'>" +
                        "<img src='" + surperScenes[i].units[j].preview_url + "'>" +
                        "</div></div></div></li>"
                    $(".super-edit .scenes ul ul.num_" + i).append(superHeadList);

                }
            }

        }
        //模板共用
        function getTrueVal(params) {
            if (params.value) {
                return params.value;
            } else {
                return params.default_value;
            }
        }
        function imgOrtext(params, mType) {
            var DOM = "";
            if (params.type === 'text') {
                params.value ? DOM = "<span >" + params.value + "</span>" : DOM = "<span>" + params.default_value + "</span>";
            } else if (params.type === 'image') {
                if (mType == 'simple') {
                    DOM =
                        "<div class='bg-wrap'>" +
                        "<div class='img-wrap'><img draggable='false' class='cover' src='" + valToImg(params, 'small') + "'></div>" +
                        "</div>"
                } else if (mType == 'super') {
                    DOM =
                        "<div class='bg-wrap'>" +
                        "<div class='img-wrap'><img draggable='false' class='cover' src='" + params.preview_url + "'></div>" +
                        "</div>"
                }
            }
            return DOM;
        }
        function valToImg(a, b) {
            var imgUrl = "";
            if (a.type == "image") {
                var c = resourcesData.userself.task;
                for (var j = 0; j < c.length; j++) {
                    if (c[j].resource_id == a.value) {
                        b == 'small' ? imgUrl = c[j].image_thumb_url : imgUrl = c[j].image_url;
                    }
                }
            }
            return imgUrl;
        }
        function setText(params) {
            if (params.type == 'text') {
                return params.value;
            } else if (params.type == 'image') {
                if (params.text) {
                    return params.text[0].value;
                } else {
                    return ""
                }
            }
        }
        function setlimit(params) {
            if (params.constraints.length > 0) {
                if (u_language == 'zh') {
                    return params.constraints[0].text_max_length.zh;
                } else if (u_language == 'en') {
                    return params.constraints[0].text_max_length.en;
                }
            } else {
                return "";
            }
        }


    }
    //内容点击事件
    function scenesClick() {
        $('.replace-matter.replace-text').on('click', function (e) {
            if (!$(e.target).hasClass('eye') && !$(e.target).hasClass('iconGroup') && !$(e.target).hasClass('img-layer') && !$(e.target).hasClass('remove')) {
                $('.win-mask').css('display', 'block');
                $('.win.change-text-win').css('display', 'flex');
                $('.text-button .text-reset').css('display', 'inline-block');
                var preview_url = $(this).attr('data-url');
                var preview_text = $(this).attr('data-text');
                var text_limit = $(this).attr('data-limit');
                $('.cropper-preview-img>img').attr('src', preview_url);
                $('.te-input-bar>textarea').val(preview_text);
                $('.te-input-bar>textarea').attr('maxLength', text_limit);
                $('.te-input-bar .num-limit').html(text_limit);
                var len = $('textarea.te-input').val().length;
                $('.te-limit .num').text(len);
                if ($(this).parent().hasClass('scenes-wrap')) {
                    $('.change-text-win .text-reset').css('display', 'none');
                } else {
                    $('.change-text-win .text-reset').css('display', 'inline-block');
                }
                reset_index = $(this).attr('data-scene') + ',' + $(this).attr('data-unit')
            }

        });


    }
    //textarea清空
    $('.change-text-win .text-empty').on('click', function () {
        $('textarea.te-input').val('');
        $('.te-limit .num').text('0');
    });
    //textarea重置
    $('.change-text-win .text-reset').on('click', function () {
        var x = reset_index.split(",")[0];
        var y = reset_index.split(",")[1];
        var resetData = projectData.scenes[x].units[y].default_value;
        $('textarea.te-input').val(resetData);
    });






});