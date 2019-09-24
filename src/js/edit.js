$(document).ready(function () {
    // var URL = 'https://lightmvapi.aoscdn.com';
    var URL = 'https://api.lightmv.com';
    var u_task_id = location.href.split("taskID=")[1];
    var u_language = 'zh';
    var u_api_token = '14973143,1562228154,f3163a7b78c57c1b4966478f395430f5';
    var u_project_file = "";

    var themeData = "";
    var projectData = "";
    var resourcesData = "";
    var resolutionData = "";
    var ossData = "";

    var idObject = "";

    var delete_music_item = ""; //临时jq对象
    var reset_x = "";
    var reset_y = "";

    var timer0;
    var timer1;
    var timer2;
    var timer3;
    var timer4;
    var timer5;
    var timer6;
    // 初始化 
    getLeft();
    getData(u_language, u_api_token);
    getLeftDom();
    getImgTextList(projectData);
    getMusic();
    getResource(u_language, u_api_token, u_task_id);

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
                    resolutionData = res.data.resolution;
                    if (u_project_file == "") {
                        u_project_file = $.extend(true, {}, projectData)
                    }
                } else {
                    console.log('请求失败')
                }
            }
        });
    }


    function changeTitleOption(language, api_token, params, type) {
        if (type == 'title') {
            var rData = {
                "language": language,
                "version": '3',
                "api_token": api_token,
                "title": params
            }
        } else if (type == 'option') {
            var rData = {
                "language": language,
                "version": '3',
                "api_token": api_token,
                "resolution": params
            }
        };
        $.ajax({
            type: "PUT",
            url: URL + "/api/tasks/" + u_task_id,
            data: rData,
            success: function (res) {
                if (res.status == '1') {
                    if (type == 'title') {
                        $('.video-title .title span').first().text(params);
                    } else {

                    }

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


    //e不为空则为音乐，为空则为图片;
    function delResources(language, api_token, e) {
        if (e == "all") {
            var arr = [];
            for(var i=0;i<resourcesData.userself.task.length;i++){
                arr.push(item.resourcesData.userself.task[i].resource_id)
            }
            var ids = JSON.stringify(arr);
        } else if (e == "") {
            var ids = "[\"" + u_project_file.scenes[reset_x].units[reset_y].value + "\"]";

        } else {
            var ids = "[\"" + e.parents('.music-item').attr('data-id') + "\"]";
        }
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
                    if (e) {
                        getData(u_language, u_api_token);
                        getMusic();
                    } else {

                    }
                }
            }
        });
    }
    //删除全部task
    // delResources(u_language, u_api_token, 'all');

    function idResource(id, language, api_token) {
        $.ajax({
            type: "GET",
            url: URL + "/api/resources/" + id,
            async: false,
            data: {
                "language": language,
                "version": '3',
                "api_token": api_token,
            },
            success: function (res) {
                idObject = res.data;
            }
        });
    }

    function getProcess(language, api_token, task_id) {
        $.ajax({
            type: "POST",
            url: URL + "/api/tasks/" + task_id + "/process",
            data: {
                "language": language,
                "version": '3',
                "api_token": api_token,
                "task_id": task_id,
            },
            success: function (res) {
                // console.log('getProcess-success');
                if (res.status == '1') {
                    $('.process-msg-confirm').show();
                    $('.win-mask').show();
                    $('.process-msg-confirm .msg-text').html('恭喜，制作成功~')
                } else {
                    $('.process-msg-confirm .msg-text').html('抱歉，制作失败，请重试一遍~')
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                /*错误信息处理*/
                console.log(jqXHR, textStatus, errorThrown);

            }
        });
    }

    function getLeftDom() {
        var tem_resolution = "";
        resolutionData == '9x16' ? tem_resolution = resolutionData + " ( 竖屏 )" : resolutionData == '16x9' ? tem_resolution = resolutionData + " ( 横屏 )" : tem_resolution = resolutionData + " ( 正方形 )";
        tem_resolution = tem_resolution.replace(/x/, ':');
        $(".cover.theme-dialog").css("backgroundImage", "url(" + themeData.cover_url + ")")
        $('.edit-wrap-info .theme-name span').first().text(themeData.title);
        $('.ratio-select .text-con.option').html(tem_resolution);
        $(".drop-menu .size-option[data-type='" + resolutionData + "']").addClass('active');
        //left 数量限制
        var unit_num = 0;
        for (var i = 0; i < projectData.scenes.length; i++) {
            if (projectData.scenes[i].is_fixed_unit_num == '0') {
                var quickDom = "<i class='iconfont iconpic'><span style='margin:0 5px;'>" + projectData.scenes[i].min_unit_num + "</span>" + '- ' + projectData.scenes[i].max_unit_num;
                $('.scene-num.quick-num').append(quickDom);
                // var expectDom = "<div class='expect'><span>预估时长</span>:<span class='estimate-time'>  00:00</span></div>";
                // $('.scene-num.quick-num').after(expectDom);
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
                    // var expectDom = "<div class='process'>" +
                    //     "<span>进度</span>:<span class='process-bar-bg'><span class='process-bar' style='width:0%;'></span></span>" +
                    //     "<span class='process-num'><span>0</span>/<span>" + themeData.statistics.image + "</span></span></div>";
                    // $('.scene-num.quick-num').after(expectDom);
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
                // console.log('resource', res);
                ossData = res.data;
                // console.log(ossData)

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
            } else if ($(event).parent().hasClass('change-text-win')) {
                $('.win.change-text-win .button .ok').removeClass('add-ok');
            } else if ($(event).parent().hasClass('upload-scenes')) {
                $('.upload-scenes .loading').hide();
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
            var c_option = $(event).attr('data-type');
            changeTitleOption(u_language, u_api_token, c_option, 'option');
        }

        // music-dialog
        if ($(event).hasClass('crop-music')) {
            $('.upload-music-win').css('display', 'flex');
            $('.win-mask').css('display', 'block');
            // getData(u_language, u_api_token);
            // getMusic();
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
            $("li.music-item").find('.iconpause').addClass('iconplay');
            $("li.music-item").find('.iconpause').removeClass('iconpause');
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
            changeTitleOption(u_language, u_api_token, c_title, 'title');
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
            delResources(u_language, u_api_token, delete_music_item);

        }

        //确认音乐
        if ($(event).hasClass('music-ok')) {
            $('.win-mask').css('display', 'none');
            $('.upload-music-win audio').get(0).load();
            $(".upload-music-win .music-play").removeClass('iconpause');
            $(".upload-music-win .music-play").addClass('iconplay');
            $(event).parent().parent().css('display', 'none');
            $('.recommend-select li').removeClass('active');
            $('.recommend-select li.mine').addClass('active');
            $('.my-music').show();
            $('.recommend-music').hide();
            getMusiclogo();
        }
        //确认修改图片
        if ($(event).hasClass('select-img')) {
            $('.win.upload-scenes').css('display', 'none');
            $('.win-mask').css('display', 'none');
        }
        //固定模板重置图片视频
        if ($(event).hasClass('remove-super')) {
            u_project_file.scenes[reset_x].units[reset_y].filename = "";
            u_project_file.scenes[reset_x].units[reset_y].value = "";
            getData(u_language, u_api_token);
            getImgTextList(u_project_file);
        }
        //取消制作
        if ($(event).hasClass('produc-cancel')) {
            $('.produce-msg-confirm').hide();
            $('.win-mask').hide();
        }
        if ($(event).hasClass('process-cancel')) {
            $('.process-msg-confirm').hide();
            $('.win-mask').hide();
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

    function changeEvent(e, changeID) {
        console.log(ossData)
        e.preventDefault();
        var f = e.target.files[0];
        var val = e.target.value;
        var suffix = val.substr(val.indexOf("."));
        var obj = new Date().getTime() + "" + Math.round(Math.random() * 10000);; // 这里是生成文件名
        // var storeAs = ossData.oss.folder + obj + suffix; //命名空间
        if (f.type.indexOf('video') == 0) {
            var storeAs = ossData.oss.video_folder + obj + suffix;
        } else {
            var storeAs = ossData.oss.folder + obj + suffix;
        }
        //callback
        var url = ossData['callback']['callbackUrl'];
        var callbackBody = ossData['callback']['callbackBody'];
        var userargs = "x:user_id=" + '14973143' + "&x:utoken=" + encodeURI('f737cffbf1a96349d71b73951413216b') + "&x:original_name=" + encodeURI(f.name.toLowerCase()) + "&x:task_id=" + u_task_id;
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

        if (changeID === "uploadMusic") {
            // <!--获取mp3文件的时间 兼容浏览器-->
            function getTime() {
                setTimeout(function () {
                    var duration = $(".upload-music-win audio")[0].duration;
                    if (isNaN(duration)) {
                        getTime();
                    } else {
                        // console.info("该歌曲的总时间为：" + $(".upload-music-win audio")[0].duration + "秒");
                        userargs += "&x:duration=" + $(".upload-music-win audio")[0].duration;
                        callback = {
                            "callbackUrl": url,
                            "callbackBody": callbackBody + userargs,
                        }
                    }
                }, 10);
            }
            // <!--把文件转换成可读URL-->
            function getObjectURL(file) {
                var url = null;
                if (window.createObjectURL != undefined) { // basic
                    url = window.createObjectURL(file);
                } else if (window.URL != undefined) { // mozilla(firefox)
                    url = window.URL.createObjectURL(file);
                } else if (window.webkitURL != undefined) { // webkit or chrome
                    url = window.webkitURL.createObjectURL(file);
                }
                return url;
            }
            var objUrl = getObjectURL(f);
            $(".upload-music-win audio").attr("src", objUrl);
            getTime();
            clearTimeout(timer0)
            timer0 = setTimeout(function () {
                var musicLoadingDom =
                    "<li class='music-item process-li'>" +
                    "<div class='music-bg'>" +
                    "<div class='process-num'><span class='num'>0</span>%</div>" +
                    "<div class='iconfont iconmusic1 music-bck'></div>" +
                    "</div>" +
                    "<div class='title'>" + f.name + "</div>" +
                    "</li>"
                $('.my-music .add-music').before(musicLoadingDom);
                var progress = function (p) {
                    return function (done) {
                        if (p == 1) {
                            $('.music-item span.num').text('99');
                            clearTimeout(timer1);
                            timer1 = setTimeout(function () {
                                $('.music-item span.num').text('100');
                            }, 5000);
                        } else {
                            $('.music-item span.num').text(Math.floor(p * 100));
                        }
                        done();
                    }
                };
                client.multipartUpload(storeAs, f, {
                    progress: progress,
                    headers: {
                        "x-oss-callback": parse(callback),
                    },
                }).then(function (result) {
                    console.log("result", result); //返回对象
                    clearTimeout(timer2);
                    timer2 = setTimeout(function () {
                        getData(u_language, u_api_token);
                        getMusic();
                    }, 5000);
                }).catch(function (err) {
                    console.log(err);
                });
            }, 200);


        } else if (changeID === "upload-media") {
            delResources(u_language, u_api_token, '');
            client.multipartUpload(storeAs, f, {
                headers: {
                    "x-oss-callback": parse(callback)
                },
            }).then(function (result) {
                // console.log("result", result); //返回对象
                if (f.type.indexOf('video') == 0) {
                    $('.upload-scenes .loading').show();
                    var appData = result.data.data.resource;
                    var x = reset_x;
                    var y = reset_y;
                    var tem_url = "";
                    idResource(appData.resource_id, u_language, u_api_token);
                    console.log(idObject)
                    u_project_file.scenes[x].units[y].filename = f.name;
                    u_project_file.scenes[x].units[y].value = idObject.resource_id;
                    idObject.video_ld_url ? tem_url = idObject.video_ld_url : tem_url = idObject.video_url;
                    $('.win.upload-scenes .preview-scenes-video').attr('src', tem_url);
                    $(".replace-matter.replace-text[data-scene='" + reset_x + "'][data-unit='" + reset_y + "']").attr("data-url", idObject.video_cover_url);
                    $(".replace-matter.replace-text[data-scene='" + reset_x + "'][data-unit='" + reset_y + "'] .img-wrap>img").attr("src", idObject.video_cover_thumb_url);
                    $(".replace-matter.replace-text[data-scene='" + reset_x + "'][data-unit='" + reset_y + "']").attr("data-text", idObject.resource_id);
                    $(".replace-matter.replace-text[data-scene='" + reset_x + "'][data-unit='" + reset_y + "']").attr("data-video", tem_url);
                    $('.upload-scenes .loading').hide();
                    resetImg(u_project_file.scenes[x].units[y], x, y);
                } else {
                    var appData = result.data.data.app_data;
                    var x = reset_x;
                    var y = reset_y;
                    $('.win.upload-scenes .preview-scenes-img').attr('src', appData.image_url);
                    $(".replace-matter.replace-text[data-scene='" + reset_x + "'][data-unit='" + reset_y + "']").attr("data-url", appData.image_url);
                    $(".replace-matter.replace-text[data-scene='" + reset_x + "'][data-unit='" + reset_y + "'] .img-wrap>img").attr("src", appData.image_thumb_url);
                    $(".replace-matter.replace-text[data-scene='" + reset_x + "'][data-unit='" + reset_y + "']").attr("data-text", appData.resource_id);
                    u_project_file.scenes[x].units[y].filename = f.name;
                    u_project_file.scenes[x].units[y].value = appData.resource_id;
                    resetImg(u_project_file.scenes[x].units[y], x, y)
                }

            }).catch(function (err) {
                console.log(err);
            });
        } else if (changeID === "add-file") {
            var add_tem_dom =
                "<li  class='replace-matter replace-li replace-text add_tem_dom'><div class='loading'><span class='iconfont iconloading2'></span></div></li>"
            $(".scenes-wrap .upload-btn").before(add_tem_dom);
            var progress = function (p) {
                return function (done) {
                    if (p == 1) {
                        clearTimeout(timer4);
                        timer4 = setTimeout(function () {
                            $(".add_tem_dom").remove();
                        }, 5000);
                    }
                    done();
                }
            };
            client.multipartUpload(storeAs, f, {
                progress: progress,
                headers: {
                    "x-oss-callback": parse(callback),
                },
            }).then(function (result) {
                console.log("addresult", result); //返回对象
                var appData = result.data.data.resource;
                var addFileArr = {
                    'filename': appData.filename,
                    'type': appData.type,
                    'value': appData.resource_id
                };
                u_project_file.scenes[1].units.push(addFileArr);
                clearTimeout(timer5);
                timer5 = setTimeout(function () {
                    getData(u_language, u_api_token);
                    getImgTextList(u_project_file);
                }, 5000)
            }).catch(function (err) {
                console.log(err);
            });
        }

    }


    $('#uploadMusic').change(function (e) {
        changeEvent(e, 'uploadMusic');
    });

    $('.upload-media').change(function (e) {
        changeEvent(e, 'upload-media')
    });

    $('#add-file').change(function (e) {
        changeEvent(e, 'add-file')
    });

    function parse(data) {
        var b = new Base64();
        var tem = JSON.stringify(data);
        var dataBase64 = b.encode(tem);
        return dataBase64;
    }

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
        var positionArr = ['.win.single-theme-win', '.win.change-text-win', '.win.msg-confirm', '.win.upload-music-win', '.win.upload-scenes', '.win.produce-msg-confirm', '.win.process-msg-confirm']
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
    //固定模板图片重置
    function resetImg(params, x, y) {
        if ((params.type === "image" || params.type === "video") && params.value) {
            $(".replace-matter.replace-text[data-scene='" + x + "'][data-unit='" + y + "']").children().find(".remove-super").css("display", "inline-block");
        }
    }
    //图片文字渲染
    function getImgTextList(pro) {
        $('ul.scenes-wrap li').remove();
        $('.scenes ul>li').remove();
        $('.simple-edit .scenes .all-dialog').remove();
        var Duration = themeData.duration;
        //自由模板
        if (Duration == '0') {
            $('.simple-edit').show();
            $('.super-edit').hide();
            //head
            var units0 = pro.scenes[0].units;
            var headAllDom = "";
            for (var i = 0; i < units0.length; i++) {
                var headDom =
                    "<div class='replace-matter replace-text all-dialog'" + "data-scene='" + "0" + "' data-unit='" + i + "'data-video='" + getVideoUrl(units0[i]) +
                    "' data-type='" + units0[i].type + "' data-limit='" + setlimit(units0[i]) + "' data-url='" + units0[i].preview_url + "' data-text='" + getTrueVal(units0[i]) + "' >" +
                    "<div class='bg scenes-head'>" +
                    "<span hidden='hidden'>文字</span>" +
                    "<span>" + getTrueVal(units0[i]) + "</span>" +
                    "</div>" +
                    "</div>"
                headAllDom += headDom;
            }
            $(".simple-edit .opening .default-title").after(headAllDom);

            //center
            var units1 = pro.scenes[1].units;
            for (var i = 0; i < units1.length; i++) {
                var imgListDom =
                    "<li  class='replace-matter replace-li replace-text'" + "data-scene='" + "1" + "' data-unit='" + i + "'data-video='" + getVideoUrl(units1[i]) +
                    "' data-type='" + units1[i].type + "' data-limit='" + "60" + "' data-url='" + valToImg(units1[i], 'big') + "' data-text='" + setText(units1[i]) + "' >" +
                    "<div class='bg'>" +
                    imgOrtext(units1[i], 'simple') +
                    "</div>" +
                    "<div class='process' style='display: block;' hidden='hidden'>" +
                    "<div class='process-bar-bg'><div class='process-bar' style='width: 99%;'></div></div>" +
                    "<div class='process-text'><span class='process-text-retry'>重新上传</span></div>" +
                    "</div>" +
                    "</div>" +
                    "<div class='button clearfix'>" +
                    "<div class='edit-media pen-edit iconfont iconwrite'></div><div class='change-text dynamic iconfont icontext'></div><div class='remove iconfont iconyichu'></div>" +
                    "</div></li>"
                $(".scenes-wrap .upload-btn").before(imgListDom);
            }
            $(".scenes-wrap li[data-type='text'] .edit-media").css('display', 'none');
            //bottom
            var units2 = pro.scenes[2].units;
            var bottomAllDom = "";
            for (var i = 0; i < units2.length; i++) {
                var bottomDom =
                    "<div class='replace-matter replace-text all-dialog'" + "data-scene='" + "2" + "' data-unit='" + i + "'data-video='" + getVideoUrl(units2[i]) +
                    "' data-type='" + units2[i].type + "' data-limit='" + setlimit(units2[i]) + "' data-url='" + units2[i].preview_url + "' data-text='" + getTrueVal(units2[i]) + "' >" +
                    "<div class='bg scenes-bottom'>" +
                    "<span hidden='hidden'>文字</span>" +
                    "<span>" + getTrueVal(units2[i]) + "</span>" +
                    "</div>" +
                    "</div>"
                bottomAllDom += bottomDom;
            }
            $(".simple-edit .ending .default-title").after(bottomAllDom);
            $(".simple-edit .add-images .default-title span").eq(1).html(pro.scenes[1].units.length);
        } else {
            //固定模板
            $('.simple-edit').hide();
            $('.super-edit').show();
            $('.top-control').css('display', 'none');
            var surperScenes = pro.scenes;
            for (var i = 0; i < surperScenes.length; i++) {
                var surperScenesBox =
                    "<li class='scene-line'>" +
                    "<div class='default-title'><span>场景</span>" + (i + 1) + "</div>" +
                    "<ul class='num_" + i + "'></ul></li>"
                $('.super-edit .scenes>ul').append(surperScenesBox);
                for (var j = 0; j < surperScenes[i].units.length; j++) {
                    var superHeadList =
                        "<li data-scene='" + i + "' data-unit='" + j + "' class='replace-matter replace-text need-replace' data-type='" + surperScenes[i].units[j].type + "' draggable='false'" + "data-limit='" + setlimit(surperScenes[i].units[j]) +
                        "' data-url='" + valToImg(surperScenes[i].units[j], 'big') + "' data-text='" + getTrueVal(surperScenes[i].units[j]) + "'data-video='" + getVideoUrl(surperScenes[i].units[j]) + "'>" +
                        "<div class='bg'>" +
                        imgOrtext(surperScenes[i].units[j], 'super') +
                        "</div>" +
                        "<div class='button'>" +
                        // "<div class='video-duration'>"+surperScenes[i].units[j].duration +"s</div>" +
                        videoDuration(surperScenes[i].units[j]) +
                        "<div class='edit iconfont iconwrite'></div><div class='remove-super iconfont iconyichu' title='恢复默认'></div>" +
                        "<div class='eye' data-align='tr' data-gap='30 0' data-layer='img-layer'>" +
                        "<span class='iconfont iconGroup'></span>" +
                        "<div class='img-layer' style='display: block; left: -118px; top: -144px;'>" +
                        "<img class='img-layer-img' src='" + eyePreview(surperScenes[i].units[j]) + "'>" +
                        "</div></div></div></li>"
                    $(".super-edit .scenes ul ul.num_" + i).append(superHeadList);
                    resetImg(surperScenes[i].units[j], i, j);
                }
            }
            $(".super-edit .scene-line li[data-type='image'] .edit").addClass('edit-media');
            $(".super-edit .scene-line li[data-type='video'] .edit").addClass('edit-media');
        }
        //模板共用
        function getTrueVal(params) {
            if (params.value || params.value == "") {
                return params.value;
            } else {
                return params.default_value;
            }
        };

        function imgOrtext(params, b) {
            var DOM = "";
            if (params.type === 'text') {
                if (params.value || params.value == "") {
                    DOM = "<span >" + params.value + "</span>";
                } else {
                    DOM = "<span>" + params.default_value + "</span>";
                }
            } else {
                DOM =
                    "<div class='bg-wrap'>" +
                    "<div class='img-wrap'><img draggable='false' class='cover' src='" + valToImg(params, 'small') + "'></div>" +
                    "</div>"
            }
            return DOM;
        };

        function valToImg(a, b) {
            var imgUrl = "";
            if (a.type == "image" || "video") {
                if (a.value) {
                    var c = resourcesData.userself.task;
                    for (var j = 0; j < c.length; j++) {
                        if (c[j].resource_id == a.value) {
                            if (b == 'small') {
                                a.type == "image" ? imgUrl = c[j].image_thumb_url : imgUrl = c[j].video_cover_thumb_url;
                            } else if (b == 'big') {
                                a.type == "image" ? imgUrl = c[j].image_url : imgUrl = c[j].video_cover_url;
                            }
                        }
                    }
                } else {
                    imgUrl = a.preview_url;
                }

            }
            return imgUrl;
        };

        function setText(params) {
            if (params.type == 'text') {
                return params.value;
            } else if (params.type == 'image' || 'video') {
                if (params.text) {
                    return params.text[0].value;
                } else {
                    return ""
                }
            }
        };

        function setlimit(params) {
            if (params.constraints.length > 0 && params.constraints[0].text_max_length) {
                if (u_language == 'zh') {
                    return params.constraints[0].text_max_length.zh;
                } else if (u_language == 'en') {
                    return params.constraints[0].text_max_length.en;
                }
            } else {
                return "";
            }
        };

        function videoDuration(params) {
            if (params.duration && params.type == 'video') {
                return "<div class='video-duration'>" + params.duration + "s</div>"
            } else {
                return ""
            }
        };

        function getVideoUrl(params) {
            var videoUrl = "";
            if (params.type == "video") {
                if (params.value) {
                    var c = resourcesData.userself.task;
                    for (var j = 0; j < c.length; j++) {
                        if (c[j].resource_id == params.value) {
                            c[j].video_ld_url ? videoUrl = c[j].video_ld_url : videoUrl = c[j].video_url;
                        }
                    }
                } else {
                    videoUrl = "";
                }

            }
            return videoUrl;
        };

        function eyePreview(params) {
            var previewUrl = "";
            if (params.value && params.type != "text") {
                var c = resourcesData.userself.task;
                for (var j = 0; j < c.length; j++) {
                    if (c[j].resource_id == params.value) {
                        params.type == "video" ? previewUrl = c[j].video_cover_thumb_url : previewUrl = c[j].image_thumb_url;
                    }
                }
            } else {
                previewUrl = params.preview_url;
            }
            return previewUrl;
        }
        scenesClick();
    }
    //内容点击事件
    function scenesClick() {
        $('.replace-matter.replace-text').on('click', function (e) {
            reset_x = $(this).attr('data-scene');
            reset_y = $(this).attr('data-unit');
            if (!$(e.target).hasClass('eye') && !$(e.target).hasClass('iconGroup') && !$(e.target).hasClass('img-layer') && !$(e.target).hasClass('remove') &&
                !$(e.target).hasClass('edit-media') && !$(e.target).hasClass('img-layer-img')) {
                if ($(this).attr('data-type') == 'text' || $(e.target).hasClass('change-text')) {
                    $('.win-mask').css('display', 'block');
                    $('.win.change-text-win').css('display', 'flex');
                    $('.text-button .text-reset').css('display', 'inline-block');
                    var preview_url = $(this).attr('data-url');
                    var preview_text = $(this).attr('data-text');
                    var text_limit = $(this).attr('data-limit');
                    preview_url == "" ? preview_url = "./images/text-bg.svg" : preview_url = preview_url;
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

                }
            } else if ($(e.target).hasClass('edit-media')) {
                $('.win-mask').css('display', 'block');
                $('.win.upload-scenes').css('display', 'flex');
                if ($(this).attr('data-type') == 'image') {
                    $(".upload-scenes .win-body").css("background", "#eee");
                    $(".upload-scenes .image").show();
                    $(".upload-scenes .video").hide();
                    $('.upload-scenes .preview-scenes-img').attr('src', $(this).attr('data-url'));
                } else if ($(this).attr('data-type') == 'video') {
                    $(".upload-scenes .image").hide();
                    $(".upload-scenes .video").show();
                    $(".upload-scenes .win-body").css("background", "#000");
                    $('.upload-scenes .preview-scenes-video').attr('src', $(this).attr('data-video'));
                }

            } else if ($(e.target).hasClass('remove')) {
                $(this).remove();
                u_project_file.scenes[reset_x].units.splice(reset_y, 1);
                getData(u_language, u_api_token);
                getImgTextList(u_project_file);
            }

        });

    }
    //自由模板添加文字
    $('.add-text').on('click', function (e) {
        $('.win.change-text-win').show();
        $('.win.change-text-win .te-input').val('');
        $('.win.change-text-win .te-limit .num-limit').html('60');
        $('.win.change-text-win .te-limit .num').html('0');
        $('.win.change-text-win .text-reset').css("display", "none");
        $('.win.change-text-win .cropper-preview-img>img').attr('src', './images/text-bg.svg');
        $('.win.change-text-win .te-input-bar>textarea').attr('maxLength', '60');
        $('.win.change-text-win .button>.ok').addClass('add-ok');
    });
    //textarea计数
    $('textarea.te-input').bind('input propertychange keyup', function () {
        var curr = $(this).val().length;
        $('.te-limit .num').text(curr.toString());
    });
    //textarea清空
    $('.change-text-win .text-empty').on('click', function () {
        $('textarea.te-input').val('');
        $('.te-limit .num').text('0');
    });
    //textarea重置
    $('.change-text-win .text-reset').on('click', function () {
        var x = reset_x;
        var y = reset_y;
        var resetData = projectData.scenes[x].units[y].default_value;
        $('textarea.te-input').val(resetData);
        var curr = $('textarea.te-input').val().length;
        $('.te-limit .num').text(curr.toString());
    });
    //确定修改
    $('.change-text-win .button .ok').on('click', function () {
        if ($(this).hasClass('add-ok')) {
            var addTextArr = {
                type: "text",
                value: $('.te-input-bar textarea').val()
            };
            u_project_file.scenes[1].units.push(addTextArr);
        } else {
            var x = reset_x;
            var y = reset_y;
            if (u_project_file.scenes[x].units[y].type == "text") {
                u_project_file.scenes[x].units[y].value = $('.te-input-bar textarea').val();
            } else if (u_project_file.scenes[x].units[y].type == "image" || "video") {
                // console.log(u_project_file.scenes[x].units[y])
                if (u_project_file.scenes[x].units[y].text) {
                    u_project_file.scenes[x].units[y].text[0].value = $('.te-input-bar textarea').val();
                } else {
                    var textArr = [{
                        type: "text",
                        value: ""
                    }]
                    u_project_file.scenes[x].units[y].text = textArr;
                    u_project_file.scenes[x].units[y].text[0].value = $('.te-input-bar textarea').val();
                }

            }

        }
        // console.log(u_project_file.scenes[x].units[y])
        $('.win.change-text-win').css('display', 'none');
        $('.win-mask').css('display', 'none');
        getData(u_language, u_api_token);
        getImgTextList(u_project_file);
        $(this).removeClass('add-ok');
    });
    // 制作视频
    $('.produce-make').on('click', function (e) {
        // console.log('u_project_file', u_project_file)
        if ($('.simple-edit').css('display') == 'block' && u_project_file.scenes[1].units.length < 4) {
            $('.simple-edit .add-images .number-warn').css('display', 'inline-block');
            clearTimeout(timer6);
            timer6 = setTimeout(function () {
                $('.simple-edit .add-images .number-warn').css('display', 'none');
            }, 2500)
        } else {
            $('.produce-msg-confirm').show();
            $('.win-mask').show();
            changeProject(u_language, u_api_token, u_project_file);
        }
    });
    $('.produce-sure').on('click', function (e) {
        $('.produce-msg-confirm').hide();
        $('.win-mask').hide();
        getProcess(u_language, u_api_token, u_task_id);
    });
    $('.process-sure').on('click', function (e) {
        $('.process-msg-confirm').hide();
        $('.win-mask').hide();
        // location.href="https://mv.lightmake.cn/user/"
    });


});