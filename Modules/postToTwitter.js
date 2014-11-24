var request = require('request')
var fs = require('fs')
var uuid = require('node-uuid')
var twitterAPI = require('node-twitter-api')

// Production App
//var baseUrl = process.env.BASE_URL || 'http://barhq-api.herokuapp.com'
// Test App
var baseUrl = process.env.BASE_URL || 'http://taffer-heroku-test.herokuapp.com'
var twitter = new twitterAPI({
	consumerKey: process.env.TWITTER_CONSUMER_KEY || 'pt8rAJvQ8Hmhp3nZmNlgapFCT',
	consumerSecret: process.env.TWITTER_CONSUMER_SECRET || 'K3eTfa6dIK0OHmXbxqzJ3gX3ex0FqQVWvmiTU9VCjpswMSwk61'
})

module.exports = function(){

	var postToTwitter = function(poster, message, imageUrl, cb){
		if(typeof imageUrl == 'function'){
			cb = imageUrl
			imageUrl = null
		}

		if(imageUrl){
			var tmpFilename = uuid.v4() + ".png"
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