var express = require('express')
var graph = require('fbgraph')

// Production App
/*
var baseUrl = process.env.BASE_URL || 'http://barhq-api.herokuapp.com'
var appId = process.env.FACEBOOK_APP_ID || '877533475604494'
var appSecret = process.env.FACEBOOK_APP_SECRET || '5e4428deec3cf75cf15ef21e8c961afe'
*/



// Test App
var baseUrl = process.env.BASE_URL || 'http://taffer-heroku-test.herokuapp.com'
var appId = process.env.FACEBOOK_APP_ID || '717433561644223'
var appSecret = process.env.FACEBOOK_APP_SECRET || 'c2438639d21449396b4ef5fa3258682e'

var postToFacebook = require('../../Modules/postToFacebook')()

module.exports = function(app, models){

	var fb = express.Router()

	fb.route('/:userId/auth')
		.get(function(req, res){
			console.log("....return.....");
			if(req.query.result){
				console.log("....return...back..");
				res.end()
				return
			}

			var failure = function(){
				res.redirect(baseUrl + '/v0.1/facebook/' + req.params.userId + '/auth?result=failure')
			}
			models.User.findOne({
				_id: models.ObjectId(req.params.userId)
			}, function(err, user){
				if(err || !user){
					failure()
				} else {
					console.log(JSON.stringify(user.facebookAccessTokenExpiration));
					console.log("\n\n.......start.........\n\n");

					graph.authorize({
						'client_id': appId,
						'client_secret': appSecret,
						'redirect_uri': baseUrl + '/v0.1/facebook/' + req.params.userId + '/auth',
						'code': req.query.code
					}, function(err, response){
						console.log("................in authorize func call..................");
						if(err){
							failure()
						} else {
							console.log("authorize....func call"+JSON.stringify(response));
							var accessToken = response.access_token,
								expiresIn = response.expires
							graph.extendAccessToken({
								'access_token': accessToken,
								'client_id': appId,
								'client_secret': appSecret
							}, function(err, response){
								if(!err){
									accessToken = response.access_token,
									expiresIn = response.expires
								}
								if(err || !accessToken){
									failure()
								} else if(expiresIn || !user.facebookAccessTokenExpiration) {
									console.log("...........................no access token...............................................");
									console.log("extend access token ....func call");
									var expirationDate = new Date()
									if(!user.facebookAccessTokenExpiration){
										expirationDate = expirationDate.addDays(60); // 60 days added to expire token
									}else if(expiresIn){
										expirationDate.setSeconds(expirationDate.getSeconds() + expiresIn)
									}
									var expirationTaskDate = expirationDate
									expirationTaskDate.setDate(expirationTaskDate.getDate() - 14)
									models.Agenda.create('facebookTokenExpiration_v0.1', {
										_id: user._id
									})
										.schedule(expirationTaskDate)
										.save(function(err, task){
											if(err){
												failure()
											} else {
												console.log("save user access token ....func call");
												models.User.update({
													_id: user._id
												}, {
													facebookTokenExpirationTask: task.attrs._id,
													facebookAccessToken: accessToken,
													facebookAccessTokenDate: new Date(),
													facebookAccessTokenExpiration: expirationDate
												}, function(err){
													if(err){
														failure()
													} else {
														console.log("get fb user id ....func call");
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
																	if(err){
																		failure()
																	} else {
																		console.log("..............................end.no access token...........................................");
																	}
																})

															}

														})
													}
												})
											}
										})
								} else {
									console.log("..................1................access token...................2...................");
									models.User.update({
										_id: user._id
									}, {
										facebookAccessToken: accessToken,
										facebookAccessTokenDate: new Date()
									}, function(err){
										if(err){
											failure()
										} else {
											console.log("..........................end access token................................................");
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
									console.log("..................................call stack finished.......................................")
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
			//console.log("request data :: "+JSON.stringify(req.user));
			console.log("req.user.facebookAccessToken :: "+req.user.facebookAccessToken);
			if(!req.user.facebookAccessToken){
				console.log("\n\n\n...................in fb access token not found call......................");
				res.redirect(baseUrl + '/v0.1/facebook/' + req.user._id.toString() + '/auth');
				/*res.send('We have not been given access to your Facebook account', 403)
				return*/
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
				facebookTokenExpiration: req.user.facebookAccessTokenExpiration,
				facebookAccessDate: new Date()
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
			/*if(!req.user.hasPermission('social.manage')){
				res.send("You do not have permission to access this bar's social media", 403)
				return
			}*/

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
			/*if(!req.user.hasPermission('social.manage')){
				res.send("You do not have permission to access this bar's social media", 403)
				return
			}*/

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
							facebookAccessToken: req.user.facebookAccessToken,
							facebookTokenExpiration: req.user.facebookAccessTokenExpiration,
							facebookAccessDate: new Date(),
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
					models.User.update(
						{ _id: req.user._id },
						{ $inc : {sharedPromotions : 1}},
						function(err){
							if(err){
								res.send(err, 500)
							} else {
								res.send(200)
							}
					});
				}
			})
		})

	fb.route('/bar/share')
		.post(app.auth, function(req, res){
			/*if(!req.user.hasPermission('social.manage')){
				res.send("You do not have permission to access this bar's social media", 403)
				return
			}*/

			models.Bar.findOne({
				_id: req.user.barId
			}, function(err, bar){
				if(err){
					res.send(err, 500)
				} else if(!bar){
					res.send('Error loading bar', 500)
				} else {
					if(!bar.facebookPageAccessToken || !bar.facebookAccessToken){
						res.send('We do not have the appropriate permissions from Facebook to post for this account', 403)
					} else {
						postToFacebook(bar, req.body.message, req.body.imageUrl, function(err){
							if(err){
								res.send(err, 500)
							} else {
								models.User.update(
									{ _id: req.user._id },
									{ $inc : {sharedPromotions : 1}},
									function(err){
										if(err){
											res.send(err, 500)
										} else {
											res.send(200)
										}
								});
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
					/*if(req.user.facebookAccessToken){
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
					} else {*/
						res.send(200)
					//}
				}
			})
		})

	fb.route('/deactivate/page')
		.delete(app.auth, function(req, res){
			//if(req.user.facebookAccessToken){
				models.Bar.update({
					_id: req.user.barId
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
			//}
		})

	fb.route('/user')
		.get(app.auth, function(req, res){

			if(!req.user.facebookAccessToken){
				res.send('We have not been given access to your Facebook account', 403)
				return
			}
			graph.get('me/?access_token=' + req.user.facebookAccessToken, function(err, response) {
				res.send(response);
			});
		})

	fb.route('/page')
		.get(app.auth, function(req, res){

			models.Bar.findOne({
				_id: req.user.barId
			}, function(err, bar){
				if(err){
					res.send(err, 500)
				} else if(!bar){
					res.send('Error loading bar', 500)
				} else {
					if(!bar.facebookPageAccessToken || !bar.facebookAccessToken){
						res.send('We do not have the appropriate permissions from Facebook to post for this account', 403)
					} else {
						if (err) {
							res.send(err, 500)
						} else {
							graph.get(bar.facebookPageId + '?access_token=' + bar.facebookAccessToken, function (err, response) {
								res.send(response);
							});
						}
					}
				}
			});
		})

	return fb

}
