var graphicsMagick = require('gm')
var gm = graphicsMagick.subClass({ imageMagick: true })
var async = require('async')
var uuid = require('node-uuid')
var aws = require('aws-sdk')
var mime = require('mime')
var fs = require('fs-extra')

var s3 = new aws.S3()


var imageBucket = process.env.IMAGE_BUCKET || 'taffer-dev'

process.env.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || 'AKIAJN5YNRA3SKPPH7BQ'

process.env.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || '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'


module.exports = function(models){
	var uploadRoute = function(req, keyRoot, cb){

		if(!req.files.images && !req.files.image){
			cb('No images attached')
			return
		}
		if(!req.files.images && req.files.image){
			req.files.images = req.files.image
		}
		if(!(req.files.images instanceof Array)){
			req.files.images = [req.files.images]
		}

		var keys = [];
		async.each(req.files.images, function(image, done){
			console.log(image);
			var path = keyRoot + '/' + uuid.v1() + image.name;
			s3.putObject({
				Bucket: imageBucket,
				Key: path,
				Body: fs.createReadStream(image.path),
				ContentType: mime.lookup(image.path),
				ACL: 'public-read'
			}, function(err, res){
				if(err) {
					done(err);
				} else {
					keys.push(path);
					done();
				}
			})

		}, function(err){
			if(err) {
				console.log("There was an error processing one of the files");
				cb(err);
				return;
			}
			
			req.files.images.forEach(function(image){
				fs.unlink(image.path, function(err){
					//Do nothing
				})
			})

			cb(null, keys);
			return;
		})

	}

	return uploadRoute

}
