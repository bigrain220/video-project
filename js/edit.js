$(document).ready(function () {
    var URL = 'https://lightmvapi.aoscdn.com';
    var u_task_id = location.href.split("taskID=")[1];
    var u_language = 'zh';
    var u_api_token = '14973143,1562228154,f3163a7b78c57c1b4966478f395430f5';

    var themeData = "";
    var projectData = "";

    function getData(language, api_token) {
        $.ajax({
            type: "get",
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
                    $(".cover.theme-dialog").css("backgroundImage", "url(" + themeData.cover_url + ")")
                    $('.edit-wrap-info .theme-name span').first().text(themeData.title)


                    //数量限制
                    var unit_num = 0;
                    for (var i = 0; i < projectData.scenes.length; i++) {
                        if (projectData.scenes[i].is_fixed_unit_num == '0') {
                            var quickDom = "<span style='margin-right: 5px;'>" + projectData.scenes[i].min_unit_num + "</span>" + '- ' + projectData.scenes[i].max_unit_num;
                            $('.scene-num.quick-num').append(quickDom);
                            var expectDom = "<div class='expect'><span>预估时长</span>:<span class='estimate-time'>  00:00</span></div>";
                            $('.scene-num.quick-num').after(expectDom);
                            break;
                        } else {
                            unit_num += 1;
                            if (unit_num === 3) {
                                var quickDom = "<span style='margin-right: 5px;'>" + themeData.statistics.image + "</span>"
                                $('.scene-num.quick-num').append(quickDom);
                                var expectDom = "<div class='process'>" +
                                    "<span>进度</span>:<span class='process-bar-bg'><span class='process-bar' style='width:0%;'></span></span>" +
                                    "<span class='process-num'><span>0</span>/<span>" + themeData.statistics.image + "</span></span></div>";
                                $('.scene-num.quick-num').after(expectDom);
                            }
                        }
                    }






                } else {
                    console.log('请求失败')
                }
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
            $('.win-mask').css('display', 'none');
            $(event).parent().css('display', 'none');
            $('.single-theme-win .left video').attr('src', "");
            $('.single-theme-win .right-free').remove();
            $('.single-theme-win .right-time').remove();
            $('.single-theme-win .video-trigger').css('display', 'none')
        }

        //options
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




    })

    $(window).resize(function () {
        getLeft();
    });
    
    $('.single-theme-win .video-playing video').on('play', function () {
        $('.video-trigger').css('display', 'none');
    });
    $('.single-theme-win .video-playing video').on('pause', function () {
        $('.video-trigger').css('display', 'block');
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
            var a = 0;
            var b = 0;
            parseInt(Duration / 60) > 9 ? a = parseInt(Duration / 60) : a = '0' + parseInt(Duration / 60);
            (Duration % 60) > 9 ? b = (Duration % 60) : b = '0' + (Duration % 60);
            var rightDom2 =
                "<div class='right-time'>" +
                "<div class='time'><span class='iconfont icontime'></span><span class='time-con'>" + a + ":" + b + "</span></div>" +
                "<div class='tip image'><span class='iconfont iconpic'></span><span class='image-con'>" + themeData.statistics.image + "张照片</span></div>" +
                "<div class='tip video'><span class='iconfont iconaddvedio'></span><span class='video-con'>" + themeData.statistics.video + "个视频</span></div>" +
                "<div class='tip tip-text'><span class='iconfont icontubiao_huabanfuben'></span><span class='text-con'>" + themeData.statistics.text + "处文字</span></div>" +
                "</div>"
            $('.single-theme-win .right h3').after(rightDom2);
        }
    }
    //dialog定位
    function getLeft() {
        var reWidth = ($(document).width() - $(".win.single-theme-win").width()) / 2;
        $(".win.single-theme-win").css('left', reWidth)
    }



    //    初始化
    getLeft();
    getData(u_language, u_api_token);

});