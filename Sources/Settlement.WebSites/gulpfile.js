var gulp = require("gulp"),
    less = require("gulp-less");
    rename = require("gulp-rename"),
    changeCase = require("change-case");
gulp.task("compile:less", function () {
    return gulp.src("Styles/styles.less")
        .pipe(less())
        .pipe(rename(function (path) {
            path.dirname = changeCase.lowerCase(path.dirname);
            path.basename = changeCase.lowerCase(path.basename);
            path.extname = changeCase.lowerCase(path.extname);
        }))
        .pipe(gulp.dest("./wwwroot//css"));
});

// Compress Images,cached
gulp.task('images', function () {
    return gulp.src('Styles/images/*')
        .pipe(gulp.dest('./wwwroot//css/images'));
});