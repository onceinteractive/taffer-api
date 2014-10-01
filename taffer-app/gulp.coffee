gulp = require "gulp"
gutil = require "gulp-util"
gulpif = require "gulp-if"
loader = require "gulp-load-plugins"
seq = require "run-sequence"

tasks = loader()

# Configuration Templates
localTemplate =
	protocol: "http"
	host: "localhost"
	port: "8688"
	version: "v0.1"

prodTemplate =
	protocol: "http"
	host: "taffer-dev.herokuapp.com"
	port: "80"
	version: "v0.1"

# Server Tasks
gulp.task "clean:server", ->
	gulp.src(".tmp/**/*", {read: false})
	.pipe tasks.clean()

gulp.task "api:server", ->
	gulp.src([
		"assets/js/services/api/api_config.js.handlebars"
	])
	.pipe(
		gulpif(
			gutil.env.api && gutil.env.api is "prod",
			tasks.compileHandlebars(prodTemplate, {}),
			tasks.compileHandlebars(localTemplate, {})
		)
	)
	.pipe(tasks.rename "api_config.js")
	.pipe gulp.dest ".tmp/js/services/api/"

gulp.task "js:server", ->
	gulp.src([
		"assets/js/**/*.coffee"
		"assets/js/**/*.js"])
	.pipe(gulpif(/[.]coffee$/, tasks.coffee()))
	.pipe(gulp.dest ".tmp/js/")
	.pipe tasks.connect.reload()

gulp.task "css:server", ->
	gulp.src([
		"assets/css/**/*.styl"
		"assets/css/**/*.scss"
		"assets/css/**/*.sass"
		"assets/css/**/*.css"])
	.pipe(gulpif /[.]styl$/, tasks.stylus())
	.pipe(gulpif /[.]scss$/, tasks.sass())
	.pipe(gulpif /[.]sass$/, tasks.sass())
	.pipe(gulp.dest ".tmp/css/")
	.pipe tasks.connect.reload()

gulp.task "html:server", ->
	gulp.src([
		"assets/**/*.jade"
		"assets/**/*.html"])
	.pipe(gulpif /[.]jade$/, tasks.jade())
	.pipe(
		tasks.htmlReplace
			"phoneFlag":
				src: "window.isPhone = false;"
				tpl: "<script>%s</script>"
		, true
	)
	.pipe(gulp.dest ".tmp/")
	.pipe tasks.connect.reload()

gulp.task "img:server", ->
	gulp.src([
		"assets/**/*.png"
		"assets/**/*.jpeg"
		"assets/**/*.jpg"
		"assets/**/*.gif"
		"assets/**/*.svg"
		"assets/**/*.otf"
		"assets/**/*.eot"
		"assets/**/*.ttf"
		"assets/**/*.woff"])
	.pipe(gulp.dest ".tmp/")
	.pipe tasks.connect.reload()

gulp.task "vendor:server", ->
	gulp.src("assets/vendor/**/*.*")
	.pipe(gulp.dest ".tmp/vendor/")
	.pipe tasks.connect.reload()

gulp.task "plugins:server", ->
	gulp.src("assets/plugins/**/*.*")
	.pipe(gulp.dest ".tmp/plugins/")
	.pipe tasks.connect.reload()

gulp.task "connect", ->
	tasks.connect.server
		root: [".tmp"]
		port: 8000
		livereload: true

gulp.task "watch", ->
	gulp.watch([
		"assets/**/*.jade"
		"assets/**/*.html"], ["html:server"])
	gulp.watch([
		"assets/js/**/*.coffee"
		"assets/js/**/*.js"], ["js:server"])
	gulp.watch([
		"assets/css/**/*.styl"
		"assets/css/**/*.sass"
		"assets/css/**/*.scss"
		"assets/css/**/*.css"], ["css:server"])
	gulp.watch([
		"assets/**/*.png"
		"assets/**/*.jpeg"
		"assets/**/*.jpg"
		"assets/**/*.gif"
		"assets/**/*.svg"
		"assets/**/*.otf"
		"assets/**/*.eot"
		"assets/**/*.ttf"
		"assets/**/*.woff"], ["img:server"])
	gulp.watch("assets/vendor/**/*.*", ["vendor:server"])
	gulp.watch("assets/plugins/**/*.*", ["plugins:server"])

# Build Tasks
gulp.task "clean:dist", ->
	gulp.src("dist/**/*", {read: false})
	.pipe tasks.clean()

gulp.task "api:dist", ->
	gulp.src([
		"assets/js/services/api/api_config.js.handlebars"
	])
	.pipe(
		gulpif(
			gutil.env.api && gutil.env.api is "local",
			tasks.compileHandlebars(localTemplate, {}),
			tasks.compileHandlebars(prodTemplate, {})
		)
	)
	.pipe(tasks.rename "api_config.js")
	.pipe gulp.dest "dist/js/services/api/"

gulp.task "js:dist", ->
	gulp.src([
		"assets/js/**/*.coffee"
		"assets/js/**/*.js"
		"assets/js/services/api/api_config.js.handlebars"])
	.pipe(gulpif(/[.]coffee$/, tasks.coffee()))
	.pipe(gulpif(/[.]handlebars$/, tasks.compileHandlebars(prodTemplate, {})))
	.pipe(tasks.concat("bundle.min.js"))
	.pipe(tasks.uglify())
	.pipe gulp.dest "dist/js/"

gulp.task "css:dist", ->
	gulp.src([
		"assets/css/**/*.styl"
		"assets/css/**/*.scss"
		"assets/css/**/*.sass"
		"assets/css/**/*.css"])
	.pipe(gulpif /[.]styl$/, tasks.stylus())
	.pipe(gulpif /[.]scss$/, tasks.sass())
	.pipe(gulpif /[.]sass$/, tasks.sass())
	.pipe(tasks.minifyCss())
	.pipe gulp.dest "dist/css/"

gulp.task "html:dist", ->
	gulp.src([
		"assets/**/*.jade"
		"assets/**/*.html"
        "assets/**/*.xml"])
	.pipe(gulpif /[.]jade$/, tasks.jade())
	.pipe(
		tasks.htmlReplace
			"user-scripts": "js/bundle.min.js"
		, true
	)
	.pipe gulp.dest "dist/"


gulp.task "img:dist", ->
	gulp.src([
		"assets/**/*.png"
		"assets/**/*.jpeg"
		"assets/**/*.jpg"
		"assets/**/*.gif"
		"assets/**/*.svg"
		"assets/**/*.otf"
		"assets/**/*.eot"
		"assets/**/*.ttf"
		"assets/**/*.woff"])
	.pipe gulp.dest "dist/"

gulp.task "vendor:dist", ->
	gulp.src("assets/vendor/**/*.*")
	.pipe(gulp.dest "dist/vendor/")

gulp.task "plugins:dist", ->
	gulp.src("assets/plugins/**/*.*")
	.pipe(gulp.dest "dist/plugins/")

# Phonegap Tasks
gulp.task "push", ->
	gulp.src("dist/**/*.*")
	.pipe gulp.dest "app/www/"

# Composite Tasks
gulp.task "server", (cb) ->
	seq "clean:server", "css:server", ["api:server", "js:server", "html:server", "img:server", "vendor:server", "plugins:server"], "connect", "watch", cb
	return

gulp.task "build", (cb) ->
	seq "clean:dist", "css:dist", ["js:dist", "html:dist", "img:dist", "vendor:dist", "plugins:dist"], cb
	return

gulp.task "default", ["build"]
