var express = require('express')
var graph = require('fbgraph')

var baseUrl = process.env.BASE_URL || 'http://taffer-heroku-test.herokuapp.com'
var appId = process.env.FACEBOOK_APP_ID || '717433561644223'
var appSecret = process.env.FACEBOOK_APP_SECRET || 'c2438639d21449396b4ef5fa3258682e'

var postToFacebook = require('../../Modules/postToFacebook')()

module.exports = function(app, models){

	var fb = express.Router()

	fb.route('/:userId/auth')
		.get(function(req, res){
			if(req.query.result){
				console.log("facebook...linking....1");
				res.end()
				return
			}

			var failure = function(){
				console.log("facebook...linking....2");
				res.redirect(baseUrl + '/v0.1/facebook/' + req.params.userId + '/auth?result=failure')
			}
			console.log("facebook...linking....3");
			console.log("userId : "+req.params.userId);
			models.User.findOne({
				_id: models.ObjectId(req.params.userId)
			}, function(err, user){
				if(err || !user){
					failure()
					console.log("facebook...linking....4");
				} else {
					graph.authorize({
						'client_id': appId,
						'client_secret': appSecret,
						'redirect_uri': baseUrl + '/v0.1/facebook/' + req.params.userId + '/auth',
						'code': req.query.code
					}, function(err, response){
						if(err){
							failure()
							console.log("facebook...linking....5");
						} else {
							console.log("facebook...linking....6");
							var accessToken = response.access_token,
								expiresIn = response.expires
							graph.extendAccessToken({
								'access_token': accessToken,
								'client_id': appId,
								'client_secret': appSecret
							}, function(err, response){
								console.log("facebook...linking....7");
								if(!err){
									accessToken = response.access_token,
									expiresIn = response.expires
								}
								console.log("facebook...linking....8");
								if(err || !accessToken){
									failure()
									console.log("facebook...linking....9");
								} else if(expiresIn){
									var expirationDate = new Date()
									console.log("facebook...linking....10");
									expirationDate.setSeconds(expirationDate.getSeconds() + expiresIn)
									console.log("facebook...linking....11");
									var expirationTaskDate = expirationDate
									expirationTaskDate.setDate(expirationTaskDate.getDate() - 14)
									models.Agenda.create('facebookTokenExpiration_v0.1', {
										_id: user._id
									})
										.schedule(expirationTaskDate)
										.save(function(err, task){
											if(err){
												failure()
												console.log("facebook...linking....11");
											} else {
												console.log("facebook...linking....12");	
												models.User.update({
													_id: user._id
												}, {
													facebookTokenExpirationTask: task.attrs._id,
													facebookAccessToken: accessToken,
													facebookAccessTokenDate: new Date(),
													facebookAccessTokenExpiration: expirationDate,
												}, function(err){
													if(err){
														failure()
														console.log("facebook...linking....13");
													} else {
														console.log("facebook...linking....14");
														//Get the user and save it if at all possible
														graph.get('me/?access_token=' + accessToken, function(err, response){
															if(!err && response){
																console.log("facebook...linking....15");
																models.User.update({
																	_id: user._id
																}, {
																	facebookUserId: response.id
																}, function(err){
																	//Nothing to do
																	if(err){
																		failure()
																		console.log("facebook...linking....16");
																	} else {
																		console.log("facebook...linking....17");
																		res.redirect(baseUrl + '/v0.1/facebook/' + req.params.userId + '/auth?result=success')				
																	}
																})

															}

														})
													}
												})
											}
										})
								} else {
									models.User.update({
										_id: user._id
									}, {
										facebookAccessToken: accessToken,
										facebookAccessTokenDate: new Date()
									}, function(err){
										if(err){
											failure()
										} else {
											res.redirect(baseUrl + '/v0.1/facebook/' + req.params.userId + '/auth?result=success')

											//Get the user and save it if at all possible
											graph.get('me/?access_token=' + accessToken, function(err, response){
												if(!err && response){

													models.User.update({
														_id: user._id
													}, {
														facebookUserId: response.id
													}, function(err){
														//Nothing to do
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
		})

	fb.route('/auth/url')
		.get(app.auth, function(req, res){
		    res.send(graph.getOauthUrl({
		        'client_id': appId,
				'redirect_uri': baseUrl + '/v0.1/facebook/' + req.user._id.toString() + '/auth',
				'scope': 'publish_actions, manage_pages, email, public_profile, user_friends'
		    }))
		})

	fb.route('/setUser')
		.post(app.auth, function(req, res){
			// if(!req.user.hasPermission('social.manage')){
			// 	res.send("You do not have permission to access this bar's social media", 403)
			// 	return
			// }

			if(!req.user.facebookAccessToken){
				res.send('We have not been given access to your Facebook account', 403)
				return
			}

			if(req.user.facebookAccessTokenExpiration < new Date()){
				res.send('Your Facebook access token has expired', 403)
				return
			}

			models.Bar.update({
				_id: req.user.barId
			}, {
				facebookPageAccessToken: null,
				facebookPageId: null,
				facebookAccessToken: req.user.facebookAccessToken,
				facebookAccessUser: req.user._id,
				facebookAccessTokenExpiration: req.user.facebookAccessTokenExpiration,
				facebookAccessTokenExpirationTask: req.user.facebookAccessTokenExpirationTask
			}, function(err){
				if(err){
					res.send(err, 500)
				} else {
					res.send(200)
				}
			})
		})

	fb.route('/accounts')
		.get(app.auth, function(req, res){
			if(!req.user.hasPermission('social.manage')){
				res.send("You do not have permission to access this bar's social media", 403)
				return
			}

			if(!req.user.facebookAccessToken){
				res.send('We have not been given access to your Facebook account', 403)
				return
			}

			if(req.user.facebookAccessTokenExpiration < new Date()){
				res.send('Your Facebook access token has expired', 403)
				return
			}

			graph.get('me/accounts?access_token=' + req.user.facebookAccessToken, function(err, response){
				if(err){
					res.send(err, 500)
				} else if(!response.data){
					res.send('No account data found', 404)
				} else {
					var accounts = []

					response.data.forEach(function(account){
						accounts.push({
							name: account.name,
							id: account.id
						})
					})

					res.send(accounts)
				}
			})
		})

		/*
			Sets the bar's page and access token
			Example Post:
			{
				pageId: String
			}
		*/
		.post(app.auth, function(req, res){
			if(!req.user.hasPermission('social.manage')){
				res.send("You do not have permission to access this bar's social media", 403)
				return
			}

			if(!req.user.facebookAccessToken){
				res.send('We have not been given access to your Facebook account', 403)
				return
			}

			if(req.user.facebookAccessTokenExpiration < new Date()){
				res.send('Your Facebook access token has expired', 403)
			}

			graph.get('me/accounts?access_token=' + req.user.facebookAccessToken, function(err, response){
				if(err){
					res.send(err, 500)
				} else if(!response.data){
					res.send('No account data found', 404)
				} else {
					var foundAccount = []

					response.data.forEach(function(account){
						if(account.id == req.body.pageId){
							foundAccount = account
						}
					})

					if(!foundAccount){
						res.send('No account matches the submitted id', 404)
					} else {
						models.Bar.update({
							_id: req.user.barId
						}, {
							facebookAccessToken: null,
							facebookAccesTokenExpiration: null,
							facebookAccessTokenExpirationTask: null,
							facebookPageId: foundAccount.id,
							facebookPageAccessToken: foundAccount.access_token,
							facebookAccessUser: req.user._id
						}, function(err){
							if(err){
								res.send(err, 500)
							} else {
								res.send(200)
							}
						})
					}
				}
			})
		})

	fb.route('/user/share')
		.post(app.auth, function(req, res){
			if(!req.user.facebookAccessToken){
				res.send('We do not have the appropriate permissions from Facebook to post for this Account', 403)
				return
			}

			postToFacebook(req.user, req.body.message, req.body.imageUrl, function(err){
				if(err){
					res.send(err, 500)
				} else {
					res.send(200)
				}
			})
		})

	fb.route('/bar/share')
		.post(app.auth, function(req, res){
			if(!req.user.hasPermission('social.manage')){
				res.send("You do not have permission to access this bar's social media", 403)
				return
			}

			models.Bar.findOne({
				_id: req.user.barId
			}, function(err, bar){
				if(err){
					res.send(err, 500)
				} else if(!bar){
					res.send('Error loading bar', 500)
				} else {

					if(!bar.facebookPageAccessToken
						|| !bar.facebookAccessToken){
						res.send('We do not have the appropriate permissions from Twitter to post for this account', 403)
					} else {
						postToFacebook(bar, req.body.message, req.body.imageUrl, function(err){
							if(err){
								res.send(err, 500)
							} else {
								res.send(200)
							}
						})
					}

				}
			})
		})

	fb.route('/deactivate')
		.delete(app.auth, function(req, res){
			models.Agenda.cancel({
				_id: req.user.facebookTokenExpirationTask
			}, function(err){
				//Nothing to do
			})

			models.User.update({
				_id: req.user._id
			}, {
				facebookAccessToken: null,
		        facebookAccessTokenDate: null,
		        facebookAccessTokenExpiration: null,
		        facebookTokenExpirationTask: null,
		        facebookUserId: null,
			}, function(err){
				if(err){
					res.send(err, 500)
				} else {
					if(req.user.facebookAccessToken){
						models.Bar.update({
							_id: req.user.barId,
							facebookAccessToken: req.user.facebookAccessToken
						}, {
							facebookPageId: null,
							facebookAccessToken: null,
							facebookPageAccessToken: null,
							facebookAccessDate: null,
							facebookTokenExpiration: null,
							facebookAccessUser: null
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

	return fb

}
