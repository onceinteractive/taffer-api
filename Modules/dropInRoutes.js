var fs = require('fs-extra')
var async = require('async')

module.exports = function(app, models){

	var dropInRoutes

	dropInRoutes = function(path, cb, root){
		fs.readdir(path, function(err, files){
			if(err){
				console.log(err)
				cb(err)
			} else {
				async.each(files, function(file, cb){
					fs.lstat(path + '/' + file, function(err, stat){
						if(err){
							cb(err)
						} else {
							if(stat.isDirectory()){
								var newRoot
								if(root){
									newRoot = root + '/' + file
								} else {
									newRoot = file
								}

								dropInRoutes(path +'/' + file, cb, newRoot)
							} else if(stat.isFile()){
								if(!root){
									app.use('/' + file.split('.js')[0],
										require('.' + path + '/' + file)(app, models))
								} else {
									app.use('/' + root + '/' + file.split('.js')[0],
										require('.' + path + '/' + file)(app, models))
								}
								cb(err)
							} else {
								cb(err)
							}
						}
					})
				}, function(err){
					cb(err)
				})
			}
		})
	}

	return dropInRoutes

}
