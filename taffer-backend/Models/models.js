var async = require('async')
var fs = require('fs-extra')

module.exports = function(mongoose, opts, cb){

	//If no options were passed, ignore them
	if(typeof opts == 'function'){
		cb = opts
		opts = null
	}

	var models = {}

	//ObjectId converter
	models.ObjectId = function(id){
		try {
			return  mongoose.Types.ObjectId(id)
		} catch(err){
			return null
		}
	}

	fs.readdir('./Models', function(err, files){
		//Return an error if applicable
		if(err){
			cb(err)
			return
		}

		async.each(files, function(file, cb){
			fs.lstat('./Models/' + file, function(err, stat){
				if(err){
					cb(err)
				} else {
					if(stat.isDirectory()){
						cb(err)
					} else if(stat.isFile() && file != 'models.js'){
						models[file.split('.js')[0]] = require('./' + file.split('.js')[0])(mongoose, models)
						cb(err)
					} else {
						cb(err)
					}
				}
			})
		}, function(err){
			cb(err, models)
		})

	})

}
