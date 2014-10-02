var request = require('request')
var fs = require('fs')
var uuid = require('node-uuid')
var twitterAPI = require('node-twitter-api')
var baseUrl = process.env.BASE_URL || 'http://taffer-dev.herokuapp.com'
var twitter = new twitterAPI({
	consumerKey: process.env.TWITTER_CONSUMER_KEY || 'Q4sO32c1lysd7m6L75CqcaAOq',
	consumerSecret: process.env.TWITTER_CONSUMER_SECRET || '0kU5xYGFS9llBdvFEjDte890bYQRw51NmrPfS5Q9iLpgcsmpQ9'
})

module.exports = function(){

	var postToTwitter = function(poster, message, imageUrl, cb){
		if(typeof imageUrl == 'function'){
			cb = imageUrl
			imageUrl = null
		}

		if(imageUrl){
			var tmpFilename = './.uploads/' + uuid.v4()
			var imageStream = fs.createWriteStream(tmpFilename)

			request(imageUrl).pipe(imageStream)
				.on('error', function(err){
					cb(err)	
				})
				.on('close', function(){
					var imageStream = fs.createReadStream(tmpFilename)
					twitter.statuses('update_with_media',
						{
							media: [ imageStream ],
							status: message
						},
						poster.twitterAccessToken,
						poster.twitterSecretToken,
						function(err, data, response){
							cb(err, data, response)
							fs.unlink(tmpFilename, function(err){
								//Nothing to do
							})
						}
					)
				})

		} else {
			twitter.statuses('update',
				{
					status: message
				},
				poster.twitterAccessToken,
				poster.twitterSecretToken,
				function(err, data, response){
					cb(err, data, response)
				}
			)
		}

	}

	return postToTwitter

}