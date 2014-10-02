var graphicsMagick = require('gm')
var gm = graphicsMagick.subClass({ imageMagick: true })
var async = require('async')
var uuid = require('node-uuid')
var aws = require('aws-sdk')
var mime = require('mime')
var fs = require('fs-extra')

var s3 = new aws.S3()

if(!process.env.IMAGE_BUCKET){
	process.env.IMAGE_BUCKET = 'taffer-dev'
}
var imageBucket = process.env.IMAGE_BUCKET
var desiredSize = {
	height: 100,
	width: 100
}

if(!process.env.AWS_ACCESS_KEY_ID){
	process.env.AWS_ACCESS_KEY_ID = 'AKIAJN5YNRA3SKPPH7BQ'
}

if(!process.env.AWS_SECRET_ACCESS_KEY){
	process.env.AWS_SECRET_ACCESS_KEY = 'SwdlCHefSY1g+mz24y+tv8Vm6tsncZCouAevUeZ9'
}


module.exports = function(models){
	var uploadRoute = function(req, dataURI, resize, cb){
		var oldImageURI = "";
		var imagePath = "";

		// Is it file upload from form data or dataURI
		if(req.files.image) {
			imagePath = req.files.image.path;
		}

		if(dataURI) {
			var regex = /^data:.+\/(.+);base64,(.*)$/;
			var matches = dataURI.match(regex);
			var ext = matches[1];
			var data = matches[2];
			var buffer = new Buffer(data, 'base64');

			imagePath = "./.uploads/" + uuid.v1() + "_tmp." + ext;
			fs.writeFileSync(imagePath, buffer);
		}

		if(typeof resize == 'function'){
			cb = resize
			resize = false
		}

		if(req.user.pictureURI){
			oldImageURI = req.user.pictureURI
		}

		async.waterfall([

			//Check if we even have a file
			function(done){
				if(!imagePath){
					done({
						status: 500,
						response: 'Image upload not on request'
					})
				} else {
					done(null)
				}
			},

			function(done){
				//Load the image into image magick
				var image = gm(imagePath)

				//Read its size data
				image.size(function(err, size){
					if(err){
						done({
							status: 500,
							response: err
						})
					} else {
						//Pass on the image and the read size
						done(null, image, size)
					}
				})
			},

			//Crop image for our ratio
			function(image, size, done){
				if(!resize){
					done(null, image)
					return
				}

				var ratio = desiredSize.height / desiredSize.width

				//If the ratio matches, we can simply move on.
				if( (size.height / size.width) != ratio){
					var crop = {}
					//Otherwise, we find the largest side
					if(size.height > size.width){

						//The new height is calculated off of the ratio
						crop.height = size.width
						crop.width = size.width

						//We crop from the middle point to
						//half way height up.
						crop.y = Math.floor((size.height / 2) - (crop.height / 2))
						crop.x = 0

					} else {

						//The new width is calculated off of the ratio
						crop.width = size.height
						crop.height = size.height

						//We crop from the middle point to
						//half way the width over
						crop.x = Math.floor((size.width / 2) - (crop.width / 2))
						crop.y = 0

					}

					//By this point, we have the crop data
					//Crop the image.
					image.crop(crop.height, crop.width, crop.x, crop.y)


				}

				//Resize image for our desired size
				//Because we cropped to our aspect ratio, we
				//only need to specify width
				image.resize(desiredSize.width)
				done(null, image)
			},

			//Now send the image to S3
			function(image, done){
				//Save the file to disk to stream
				//This is due to a weakness in gm - can't accurately determine stream length
				var imageFile = uuid.v1() + '.jpg'
				image.setFormat('jpeg').write('./.uploads/' + imageFile, function(err){
					if(err){
						done({
							status: 500,
							response: err
						})
					} else {
						var readStream = fs.createReadStream('./.uploads/' + imageFile)
						// stdout.length = filesize
						var key = 'userImages/' + req.user._id + '/' + imageFile
						var data = {
							Bucket: imageBucket,
							Key: key,
							Body: readStream,
							ContentType: mime.lookup(imagePath),
							ACL: 'public-read'
						}
						s3.putObject(data, function(err, res){
							if(err){
								done({
									status: 500,
									response: err.message
								}, null, './.uploads/' + imageFile)
							} else {
								done(null, key, './.uploads/' + imageFile)
							}
						})
					}
				})
			}

		], function(err, imageKey, resultPath){
			console.log("ERROR", err);
			console.log("KEY", imageKey);
			console.log("RESULT PATH", resultPath);
			cb(err, imageKey)

			//After the upload, destroy the image files on the server
			if(imagePath){
				fs.unlink(imagePath, function(err){

				})
			}
			if(resultPath){
				fs.unlink(resultPath, function(err){

				})
			}

			//Remove the old image if existed
			//TODO - remove this from image upload into cleanup for
			//register/users

			// if(oldImageURI){
			// 	s3.removeObject({
			// 		Bucket: imageBucket,
			// 		Key: oldImageURI
			// 	}, function(err, data){

			// 	})
			// }
		})
	}

	return uploadRoute

}
