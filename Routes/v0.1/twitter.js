var express = require('express')
var twitterAPI = require('node-twitter-api')

var baseUrl = process.env.BASE_URL || 'http://taffer-heroku-test.herokuapp.com'
var consumerKey = process.env.TWITTER_CONSUMER_KEY || 'pt8rAJvQ8Hmhp3nZmNlgapFCT'
var consumerSecret = process.env.TWITTER_CONSUMER_SECRET || 'K3eTfa6dIK0OHmXbxqzJ3gX3ex0FqQVWvmiTU9VCjpswMSwk61'

var postToTwitter = require('../../Modules/postToTwitter')()

module.exports = function(app, models){

	var twitter = express.Router()

	twitter.route('/user/requestToken')
		.get(app.auth, function(req, res){
			var twitter = new twitterAPI({
				consumerKey: consumerKey,
				consumerSecret: consumerSecret,
				callback: baseUrl + '/v0.1/twitter/user/' + req.user._id + '/auth'
			})

			twitter.getRequestToken(function(err, requestToken, requestTokenSecret, results){
				if(err){
					res.send(err, 500)
				} else {
					models.User.update({
						_id: req.user._id
					}, {
						twitterRequestToken: requestToken,
						twitterRequestTokenSecret: requestTokenSecret
					}, function(err){
						if(err){
							res.send(err, 500)
						} else {
							res.send({
								requestToken: requestToken
							})
						}
					})
				}
			})
		})

	twitter.route('/bar/requestToken')
		.get(app.auth, function(req, res){
			if(!req.user.hasPermission('social.manage')){
				res.send("You do not have permission to manage this bar's social media.")
			}

			var twitter = new twitterAPI({
				consumerKey: consumerKey,
				consumerSecret: consumerSecret,
				callback: baseUrl + '/v0.1/twitter/bar/' + req.user.barId + '/auth'
			})

			twitter.getRequestToken(function(err, requestToken, requestTokenSecret, results){
				if(err){
					res.send(err, 500)
				} else {
					models.Bar.update({
						_id: req.user.barId
					}, {
						twitterRequestToken: requestToken,
						twitterRequestTokenSecret: requestTokenSecret
					}, function(err){
						if(err){
							res.send(err, 500)
						} else {
							res.send({
								requestToken: requestToken
							})
						}
					})
				}
			})

		})

	twitter.route('/user/:userId/auth')
		.get(function(req, res){
			if(req.query.result){
				res.end()
				return
			}

			var failure = function(){
				res.redirect(401, baseUrl + '/v0.1/twitter/user/' + req.params.userId + '/auth?result=failure')
			}

			models.User.findOne({
				_id: models.ObjectId(req.params.userId)
			}, function(err, user){
				if(err || !user){
					failure()
				} else if(!req.query.oauth_token
					|| !req.query.oauth_verifier){
					failure()
				} else if(req.query.oauth_token != user.twitterRequestToken){
					failure()
				} else {
					var twitter = new twitterAPI({
						consumerKey: consumerKey,
						consumerSecret: consumerSecret,
						callback: baseUrl + '/v0.1/twitter/user/' + req.params.userId + '/auth'
					})

					twitter.getAccessToken(req.query.oauth_token,
						user.twitterRequestTokenSecret,
						req.query.oauth_verifier, function(err, accessToken, accessTokenSecret, results){
							if(err){
								failure()
							} else {
								twitter.verifyCredentials(accessToken,
									accessTokenSecret,
									function(err, data, response){
										if(err){
											failure()
										} else {
											models.User.update({
												_id: user._id
											}, {
												twitterUserId: data.id,
												twitterAccessToken: accessToken,
												twitterSecretToken: accessTokenSecret,
												twitterRequestToken: null,
												twitterRequestTokenSecret: null,
												twitterAccessDate: new Date()
											}, function(err){
												if(err){
													failure()
												} else {
													res.redirect(baseUrl + '/v0.1/twitter/user/' + req.params.userId + '/auth?result=success')
												}
											})
										}
									}
								)
							}
						})
				}
			})
		})

	twitter.route('/bar/:barId/auth')
		.get(function(req, res){
			if(req.query.result){
				res.end()
				return
			}

			var failure = function(){
				res.redirect(401, baseUrl + '/v0.1/twitter/bar/' + req.params.barId + '/auth?result=failure')
			}

			models.Bar.findOne({
				_id: models.ObjectId(req.params.barId)
			}, function(err, bar){
				if(err || !bar){
					failure()
				} else if(!req.query.oauth_token
					|| !req.query.oauth_verifier){
					failure()
				} else if(req.query.oauth_token != bar.twitterRequestToken){
					failure()
				} else {
					var twitter = new twitterAPI({
						consumerKey: consumerKey,
						consumerSecret: consumerSecret,
						callback: baseUrl + '/v0.1/twitter/bar/' + req.params.barId + '/auth'
					})

					twitter.getAccessToken(req.query.oauth_token,
						bar.twitterRequestTokenSecret,
						req.query.oauth_verifier, function(err, accessToken, accessTokenSecret, results){
							if(err){
								failure()
							} else {
								models.Bar.update({
									_id: bar._id
								}, {
									twitterAccessToken: accessToken,
									twitterSecretToken: accessTokenSecret,
									twitterRequestToken: null,
									twitterRequestTokenSecret: null,
									twitterAccessDate: new Date()
								}, function(err){
									if(err){
										failure()
									} else {
										res.redirect(baseUrl + '/v0.1/twitter/bar/' + req.params.barId + '/auth?result=success')
									}
								})

								twitter.verifyCredentials(accessToken,
									accessTokenSecret,
									function(err, data, response){
										if(err){
											//Nothing to do
										} else {
											models.User.update({
												_id: bar.ownerId
											}, {
												twitterUserId: data.id,
												twitterAccessDate: new Date()
											}, function(err){
												//Nothing to do
											})
										}
									}
								)

							}
						})
				}
			})
		})

	twitter.route('/user/share')
		.post(app.auth, function(req, res){
			console.log("twitter access token user "+req.user.twitterAccessToken);
			console.log("twitter secret token user "+req.user.twitterSecretToken);
			if(!req.user.twitterAccessToken ||
				!req.user.twitterSecretToken){
				res.send('We do not have the appropriate permissions from Twitter to post for this account', 403)
			} else {
				postToTwitter(req.user, req.body.message, req.body.imageUrl, function(err){
					if(err){
						res.send(err, 500)
					} else {
						res.send(200)
					}
				})
			}
		})

	twitter.route('/bar/share')
		.post(app.auth, function(req, res){
			if(!req.user.hasPermission('social.manage')){
				res.send("You do not have permission to access this bar's social media", 403)
			} else {

				models.Bar.findOne({
					_id: req.user.barId
				}, function(err, bar){
					if(err){
						res.send(err, 500)
					} else if(!bar){
						res.send('Error loading bar', 500)
					} else {

						if(!bar.twitterAccessToken ||
							!bar.twitterSecretToken){
							res.send('We do not have the appropriate permissions from Twitter to post for this account', 403)
						} else {
							postToTwitter(bar, req.body.message, req.body.imageUrl, function(err){
								if(err){
									res.send(err, 500)
								} else {
									res.send(200)
								}
							})
						}

					}
				})


			}
		})

	twitter.route('/deactivate')
		.delete(app.auth, function(req, res){
			models.User.update({
				_id: req.user._id
			}, {
				twitterRequestToken: null,
		        twitterRequestTokenSecret: null,
		        twitterAccessToken: null,
		        twitterSecretToken: null,
		        twitterAccessDate: null,
		        twitterUserId: null
			}, function(err){
				if(err){
					res.send(err, 500)
				} else {
					if(req.user.twitterAccessToken){
						models.Bar.update({
							barId: req.user.barId,
							twitterAccessToken: req.user.twitterAccessToken
						}, {
							twitterRequestToken: null,
							twitterRequestTokenSecret: null,
							twitterAccessToken: null,
							twitterSecretToken: null,
							twitterAccessDate: null
						}, function(err){
							if(err){
								res.send(err, 500)
							} else {
								res.send(200)
							}
						})
					} else {
						res.send(200)
					}
				}
			})
		})

	return twitter

}
