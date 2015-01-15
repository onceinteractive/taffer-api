var graph = require('fbgraph')

module.exports = function(){

	/*
		facebook post function
			gets the appropriate access token, generates a graph API call to post to wall

			poster - poster object (bar or user)
			message - the text being posted
			picture - optional - picture being posted
			cb - function(err) - callback function
	*/
	var facebook = function(poster, message, imageUrl, cb){

		if(typeof imageUrl == 'function'){
			cb = imageUrl
			imageUrl = null
		}
		
		if(!poster.facebookPageAccessToken &&
			!poster.facebookAccessToken){
			cb('This poster does not have a valid access token associated with it')
			return
		}

		var token = poster.facebookPageAccessToken || poster.facebookAccessToken

		var post = {
			message: message,
			caption: "BarHQ"
		}

		if(imageUrl){
			post.picture = imageUrl
		}
				
		graph.post('me/feed?access_token=' + token,
			post,
			function(err, result){
				cb(err, result)
			})

	}

	return facebook

}