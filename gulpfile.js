var gulp = require('gulp');
var imagemin = require('gulp-imagemin');  
var uglify = require("gulp-uglify");  
var cleanCSS = require('gulp-clean-css');


//文件合并
gulp.task("copyHtml",function(){
    gulp.src("src/*.html")
        .pipe(gulp.dest("dist"))  //把src目录中所有html格式的文件全部合并到dist目录中
})
 
//图片压缩
gulp.task("imagemin",function() {
    gulp.src("src/images/*")   //所有src > images中的图片
        .pipe(imagemin())  //图片压缩
        .pipe(gulp.dest("dist/images"))  //放入到dist目录下面的images文件
})
 
//js压缩
gulp.task("uglify",function() {
    gulp.src("src/js/*.js")
        .pipe(uglify()) //压缩js代码
        .pipe(gulp.dest("dist/js")) //通过gulp uglify命令，自动输出dist下面js文件
})
 
//css压缩
gulp.task("lessc",function() {
    gulp.src("src/css/*.css")
        .pipe(cleanCSS())  //压缩css
        .pipe(gulp.dest("dist/css"))   //通过gulp lessc 命令，自动输出dist/css文件
})
 
//监听文件是否有变化
gulp.task("watch",function(){
    gulp.watch("src/*.html",gulp.series("copyHtml"));
    gulp.watch("src/images/*",gulp.series("imagemin"));
    gulp.watch("src/js/*.js",gulp.series("uglify"));
    gulp.watch("src/css/*.css",gulp.series("lessc"))
})
//通过输入gulp watch自动编译，修改一处即可生成一类。