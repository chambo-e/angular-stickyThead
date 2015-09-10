(function () {
    'use strict';

    var gulp = require('gulp');
    var uglify = require('gulp-uglify');
    var jshint = require('gulp-jshint');
    var stylish = require('jshint-stylish');
    var jscs = require('gulp-jscs');
    var bumper = require('gulp-bump');
    var git = require('gulp-git');
    var shell = require('gulp-shell');
    var rename = require('gulp-rename');
    var sourcemaps = require('gulp-sourcemaps');
    var fs = require('fs');
    var sequence = require('gulp-sequence');
    var ngAnnotate = require('gulp-ng-annotate');

    gulp.task('lint', function () {
        return gulp.src('src/**/*.js')
            .pipe(jshint())
            .pipe(jshint.reporter(stylish));
    });

    gulp.task('style', function () {
        return gulp.src('src/**/*.js')
            .pipe(jscs());
    });

    gulp.task('bower', function () {
        return gulp.src('src/angular-stickyThead.js')
            .pipe(ngAnnotate({
                single_quotes: true
            }))
            .pipe(gulp.dest('./dist'));
    });

    gulp.task('js', ['lint', 'style', 'bower'], function () {
        return gulp.src('src/angular-stickyThead.js')
            .pipe(ngAnnotate({
                single_quotes: true
            }))
            .pipe(sourcemaps.init())
            .pipe(uglify())
            .pipe(rename('angular-stickyThead.min.js'))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./dist'));
    });

    gulp.task('git-commit', function () {
        var v = version();
        gulp.src(['./dist/*', './package.json', './bower.json', './src/*'])
            .pipe(git.add())
            .pipe(git.commit(v));
    });

    gulp.task('git-push', function (cb) {
        var v = version();
        git.push('origin', 'master', function (err) {
            if (err) return cb(err);
            git.tag(v, v, function (err) {
                if (err) return cb(err);
                git.push('origin', 'master', {
                    args: '--tags'
                }, cb);
            });
        });
    });

    gulp.task('bump-patch', bump('patch'));
    gulp.task('bump-minor', bump('minor'));
    gulp.task('bump-major', bump('major'));

    gulp.task('npm', shell.task([
        'npm publish'
    ]));

    gulp.task('watch', function () {
        gulp.watch('./*.js', ['js']);
        return true;
    });

    function bump(level) {
        return function () {
            return gulp.src(['./package.json', './bower.json'])
                .pipe(bumper({
                    type: level
                }))
                .pipe(gulp.dest('./'));
        };
    }

    function version() {
        return JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
    }

    gulp.task('default', sequence('check', 'js'));
    gulp.task('check', sequence(['lint', 'style']));
    gulp.task('deploy-patch', sequence('default', 'bump-patch', 'git-commit', 'git-push', 'npm'));
    gulp.task('deploy-minor', sequence('default', 'bump-minor', 'git-commit', 'git-push', 'npm'));
    gulp.task('deploy-major', sequence('default', 'bump-patch', 'git-commit', 'git-push', 'npm'));

})();
