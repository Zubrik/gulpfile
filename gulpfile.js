var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
var useref = require('gulp-useref'); 
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var minifyCSS = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
var merge = require('merge-stream');
var size = require('gulp-size');

// Development Tasks 
// -----------------

// Start browserSync server
gulp.task('browserSync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		}
	})
})

// Copiar fitxers js de Bower a app
gulp.task('copyJSFiles', function() {
	var modernizr = gulp.src('app/bower_components/foundation/js/vendor/modernizr.js')
		.pipe(gulp.dest('app/media/js/vendor'));
	var jquery = gulp.src('app/bower_components/jquery/dist/jquery.min.js')
		.pipe(gulp.dest('app/media/js/vendor'));
	var fastclick = gulp.src('app/bower_components/foundation/js/vendor/fastclick.js')
		.pipe(gulp.dest('app/media/js/vendor'));
	var foundationJS = gulp.src('app/bower_components/foundation/js/foundation.min.js')
		.pipe(gulp.dest('app/media/js/foundation'));
	var foundationPlugins = gulp.src('app/bower_components/foundation/js/foundation/*.js')
		.pipe(gulp.dest('app/media/js/foundation'));
	return merge(modernizr, jquery, fastclick, foundationJS, foundationPlugins);
});

gulp.task('sass', function() {
	return gulp.src('app/media/scss/**/*.scss') // Gets all files ending with .scss in app/scss and children dirs
		.pipe(sass({ // Passes it through a gulp-sass
			includePaths: ['app/bower_components', 'app/bower_components/foundation/scss'],
			errLogToConsole: true
		}))
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
		}))
		.pipe(size({
			title: 'Mida total app.css'
		}))
		.pipe(gulp.dest('app/media/css')) // Outputs it in the css folder
		.pipe(browserSync.reload({ // Reloading with Browser Sync
			stream: true
		}));
})

// Watchers
gulp.task('watch', function() {
	gulp.watch('app/media/scss/**/*.scss', ['sass']);
	gulp.watch('app/*.html', browserSync.reload); 
	gulp.watch('app/media/js/**/*.js', browserSync.reload); 
})

// Optimization Tasks 
// ------------------

// Optimizing CSS and JavaScript 
gulp.task('useref', function() {
	var assets = useref.assets();

	return gulp.src('app/*.html')
		.pipe(assets)
		// Minifies only if it's a CSS file
		.pipe(gulpIf('*.css', minifyCSS()))
		// Uglifies only if it's a Javascript file
		.pipe(gulpIf('*.js', uglify()))
		.pipe(assets.restore())
		.pipe(useref())
		.pipe(gulp.dest('dist'))
});

// Optimizing Images 
gulp.task('images', function() {

	var htmlImgs = gulp.src('app/media/img/**/*.+(png|jpg|jpeg|gif|svg)')
		// Caching images that ran through imagemin
		.pipe(cache(imagemin({
			interlaced: true,
		})))
		.pipe(gulp.dest('dist/media/img'))
	var cssImgs = gulp.src('app/media/css/img/**/*.+(png|jpg|jpeg|gif|svg)')
		// Caching images that ran through imagemin
		.pipe(cache(imagemin({
			interlaced: true,
		})))
		.pipe(gulp.dest('dist/media/css/img'))
	return merge(htmlImgs,cssImgs);
});

// Building Tasks 
// --------------

// Copying css 
gulp.task('css', function() {
	return gulp.src(['app/media/css/ie8-grid-support.css','app/media/css/ie8.css'])
	.pipe(gulp.dest('dist/media/css'))
})

// Copying fonts 
gulp.task('fonts', function() {
	return gulp.src('app/media/fonts/**/*')
	.pipe(gulp.dest('dist/media/fonts'))
})

// Cleaning 
gulp.task('clean', function(callback) {
	del('dist');
	return cache.clearAll(callback);
})

gulp.task('clean:dist', function(callback) {
	del(['dist/**/*', '!dist/media/img', '!dist/media/img/**/*', '!dist/media/css/img', '!dist/media/css/img/**/*'], callback)
});


// Build Sequences
// ---------------

gulp.task('default', function(callback) {
	runSequence(['copyJSFiles', 'sass', 'browserSync', 'watch'],
		callback
	)
})

gulp.task('build', function(callback) {
	runSequence('clean:dist', ['sass', 'useref', 'images', 'css', 'fonts'],
		callback
	)
})
