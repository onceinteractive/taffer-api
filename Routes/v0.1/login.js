var uuid = require('node-uuid')

var express = require('express')

// Production App 
var baseUrl = process.env.BASE_URL || 'http://barhq-api.herokuapp.com'
// Test App
//var baseUrl = process.env.BASE_URL || 'http://taffer-heroku-test.herokuapp.com'
//Twitter Production App
/*

var consumerKey = process.env.TWITTER_CONSUMER_KEY || 'wW5zpikQPxXefHRscyT6FgUQx'
var consumerSecret = process.env.TWITTER_CONSUMER_SECRET || 'mTjacdvJjuvYwiIisqkTCgosattPpUtMTjMPyWQDrkWNycpd1G'
*/

//Twitter Test App
var consumerKey = process.env.TWITTER_CONSUMER_KEY || '6kk1hqDGjz8Q8BxS4JFRP9dTz'
var consumerSecret = process.env.TWITTER_CONSUMER_SECRET || 'zTKjwtRt5Vn3jgd3czIE5qGBvudcMfyMxgrDOY5TANFjoFPWrZ'
var twitterAPI = require('node-twitter-api')
var twitter = new twitterAPI({
		consumerKey: consumerKey,
		consumerSecret: consumerSecret,
		callback: baseUrl + '/v0.1/login/twitter/auth'
	})

//Facebook stuff
var graph = require('fbgraph')

// Facebook Production App

var appId = process.env.FACEBOOK_APP_ID || '877533475604494'
var appSecret = process.env.FACEBOOK_APP_SECRET || '5e4428deec3cf75cf15ef21e8c961afe'

// Facebook Test App
/*
var appId = process.env.FACEBOOK_APP_ID || '402154059950883'
var appSecret = process.env.FACEBOOK_APP_SECRET || '6b60d0fb02536f5d049e2329a62016d4'
*/
module.exports = function(app, models){

	var login = express.Router()

	login.route('/')

		.post(function(req, res){
			if(!req.body || !req.body.email || !req.body.password){
				res.send(401)
			} else {
				models.User.findOne({
					email: req.body.email.toLowerCase()
				}, function(err, user){
					if(err || !user){
						res.send(401)
					} else {

						user.authenticatePassword(req.body.password, function(err, result){
							if(err){
								res.send(401)
							} else if(!result){
								res.send(401)
							} else {

								res.cookie('id', user._id, { signed: true })
								var token = uuid.v4()
								res.cookie('token', token, { signed: true })

								user.update({
									sessionToken: token,
									lastLogin: new Date()
								}, function(err){
									if(err){
										res.send(401)
									} else {
										var json = user.json()
										json.token = token
										res.send(json)
									}
								})
							}
						})

					}
				})
			}
		})

		['delete'](app.auth, function(req, res){
			res.clearCookie('id')
			res.clearCookie('token')
			req.user.update({
				sessionToken: uuid.v4()
			}, function(err){
				res.send(200)
			})

		})

	login.route('/twitter/requestUrl')
		.get(function(req, res){
			twitter.getRequestToken(function(err, requestToken, requestTokenSecret, results){
				if(err){
					res.send(err, 500)
				} else {
					models.TwitterLogin.create({
						requestToken: requestToken,
						requestTokenSecret: requestTokenSecret
					}, function(err, tokens){
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

	login.route('/twitter/auth')
		.get(function(req, res){
			if(req.query.result){
				res.end()
				return
			}

			var failure = function(){
				res.redirect(baseUrl + '/v0.1/login/twitter/auth?result=failure&')
			}

			if(req.query['oauth_v erifier'] && !req.query.oauth_verifier){
				req.query.oauth_verifier = req.query['oauth_v erifier']
			}

			if(!req.query.oauth_token
				|| !req.query.oauth_verifier){
				failure()
			} else {
				var fifteenMinutesAgo = new Date()
				fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15)
				//Grab any token created in the past 15 minutes with this
				//requestToken
				models.TwitterLogin.findOne({
					requestToken: req.query.oauth_token,
					created: {
						$gte: fifteenMinutesAgo
					}
				}, function(err, tokens){
					if(err){
						failure()
					} else if(!tokens){
						failure()
					} else{
						twitter.getAccessToken(req.query.oauth_token,
								tokens.requestTokenSecret,
								req.query.oauth_verifier,
								function(err, accessToken, accessTokenSecret, results){
									if(err){
										failure()
									} else {
										twitter.verifyCredentials(accessToken,
											accessTokenSecret,
											function(err, data, response){
												if(err){
													failure()
												} else {
													//Now we have the user id (data.id). Find the user with that as their id
													models.User.findOne({
														twitterUserId: data.id,
													}, function(err, user){
														if(err){
															failure()
														} else if(!user){
															failure()
														} else {
															var token = uuid.v4()
															
															user.update({
																sessionToken: token,
																lastLogin: new Date()
															}, function(err){
																if(err){
																	failure()
																} else {
																	res.redirect(baseUrl + '/v0.1/login/twitter/auth?result=success&id=' + user._id + '&token=' + token)
																}
															})
														}
													})

												}
											})
									}
								})
					}
				})
			}
		})

	login.route('/facebook/requestUrl')
		.get(function(req, res){
			res.send(graph.getOauthUrl({
		        'client_id': appId,
				'redirect_uri': baseUrl + '/v0.1/login/facebook/auth',
				'scope': 'publish_actions, manage_pages, email, public_profile, user_friends'
		    }))
		})

	login.route('/facebook/auth')
		.get(function(req, res){
			if(req.query.result){
				res.end()
				return
			}

			var failure = function(err){
				res.redirect(baseUrl + '/v0.1/login/facebook/auth?result=failure&err=' + err.toString())
			}

			graph.authorize({
				'client_id': appId,
				'redirect_uri': baseUrl + '/v0.1/login/facebook/auth',
				'client_secret': appSecret,
				'code': req.query.code
			}, function(err, response){
				if(err){
					failure(err)
				} else {
					var accessToken = response.access_token
					var expiresIn = response.expires

					if(!accessToken){
						failure('No access token')
						return
					}

					graph.get('me', function(err, response){
						if(err){
							failure(err)
							return
						}

						if(!response.id){
							failure('No id in user')
							return
						}

						models.User.findOne({
							facebookUserId: response.id,
							locked: false
						})
						.populate('bar')
						.exec(function(err, user){
							if(err){
								failure(err)
							} else if(!user){
								failure('No user found')
							} else {

								var token = uuid.v4()
															
								user.update({
									sessionToken: token,
									lastLogin: new Date()
								}, function(err){
									if(err){
										failure('Error updating token')
									} else {
										res.redirect(baseUrl + '/v0.1/login/facebook/auth?result=success&id=' + user._id + '&token=' + token)

										//Try and update the token while we're here
										graph.extendAccessToken({
											'access_token': accessToken,
											'client_id': appId,
											'client_secret': appSecret
										}, function(err, response){
											if(err){
												return
											}

											if(response.access_token){
												accessToken = accessToken
											}
											if(response.expires){
												expiresIn = response.expires
											}

											if(!expiresIn){
												return
											}

											var expirationDate = new Date()

											expirationDate.setSeconds(expirationDate.getSeconds() + expiresIn)

											if(expirationDate <= user.facebookAccessTokenExpiration){
												return
											}

											models.Agenda.create('facebookTokenExpiration_v0.1', {
												_id: user._id
											})
												.schedule(expirationDate)
												.save(function(err, task){
													if(err){
														return
													} else {
														
														models.Agenda.cancel({
															_id: user.facebookTokenExpirationTask
														}, function(err){
															//Nothing to do
														})

														models.User.update({
															_id: user._id
														}, {
															facebookTokenExpirationTask: task.attrs._id,
															facebookAccessToken: accessToken,
															facebookAccessTokenDate: new Date(),
															facebookAccessTokenExpiration: expirationDate,
														}, function(err, user){
															if(err){
																return
															} else {
																
																//Check the bar
																if(facebookAccessUser.toString() == user._id.toString()){
																	models.Bar.update({
																		facebookAccessToken: accessToken,
																		facebookTokenExpiration: expirationDate,
																		facebookAccessDate: new Date()
																	}, function(err){
																		//Nothing to do
																		return
																	})
																}

															}
														})
													}
												})

											})

									}
								})

							}

						})
					})
				}
			})
	})

	return login

}
