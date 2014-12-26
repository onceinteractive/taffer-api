var express = require('express');
var async = require('async');
var uuid = require('node-uuid');
var util = require('util');
var graph = require('fbgraph')
var underscore = require('underscore')

module.exports = function(app, models){

	var users = express.Router();
	var pushNotification = require('../../Modules/pushNotifications')(app, models);

	users.route('/')

		//Registration route for creating a user
		.post(function(req, res){
			if(!req.body.email || req.body.password){
				if(req.body.password.length < 8){
					res.send(500, 'Passwords must be at least 8 characters')
					return
				}
			}

			var user = models.User({
				email: req.body.email.toLowerCase(),
				firstName: req.body.firstName,
				lastName: req.body.lastName
			})

			user.save(function(err, user){
				if(err){
					if(err.code && err.code == 11000){
						res.send(501, 'This e-mail address already has an account')
					} else {
						res.send(500, err)
					}
				} else {
					user.setPassword(req.body.password, function(err){
						//Log the user in as themselves and return 200 OK
						res.cookie('id', user._id, { signed: true })
						var token = uuid.v4()
						res.cookie('token', token, { signed: true })

						user.update({
							sessionToken: token,
							lastLogin: new Date()
						}, function(err){
							res.send(user.json())
						})
					})
				}
			})
		})

		//User sync
		.get(app.auth, function(req, res){
			models.User.findOne({
				_id: req.user._id
			})
				//.populate('badges')
				.exec(function(err, user){
					if(err || !user){
						res.send(err, 500)
					} else {
						var userObj = user.json();
						models.User.findOne({
							_id: req.user._id
						})
							.populate('barId')
							.exec(function(err, bar){
								if(err || !bar){
									res.send(err, 500)
								} else {
									var barObj = {
										facebookPageId: bar.barId.facebookPageId,
										facebookPageAccessToken: bar.barId.facebookPageAccessToken
									}
									var respObj = underscore.extend(userObj, barObj);
									res.send(respObj)
								}
						})
						//res.send(user.json())
					}
				})
		})


	users.route('/resetPassword')
		.post(function(req, res){
			if(!req.body || !req.body.email){
				res.send('No email attached', 500)
			} else {
				models.User.findOne({
					email: req.body.email.toLowerCase()
				}, function(err, user){
					if(err || !user){
						res.send(404)
					} else {
						var newPassword = Math.random().toString(36).slice(-8)

						user.setPassword(newPassword, function(err){
							app.mail(user,
								'Your Bar HQ password has been reset',
								'passwordReset',
								{
									firstName: user.firstName,
									password: newPassword
								}, function(err){
									if(err){
										res.send(err, 500)
									} else {
										res.send(200)
									}
							})
						})

					}
				})
			}
		})

	var uploadRoute = require('../../Modules/imageUpload')(models)
	users.route('/image')
		.post(app.auth, function(req, res){
			var oldUri = req.user.pictureURI
			updateRegistrationStatus(req.user, function(err, user){
				if(err){
					res.send(err.response, err.status)
				} else {
					req.user.update({
						pictureURI: imageKey
					}, function(err, user){
						res.send(user.json())
					})
				}
			})
		})

	users.route('/device')

		//Register a device if necessary
		/*
			Example POST Body:
			{
				deviceToken: String
				deviceType: String
				deviceVersion: String
			}
		*/
		.post(app.auth, function(req, res){
			res.send(200)

			async.waterfall([

				function(done){
					models.Device.findOne({
						deviceToken: req.body.deviceToken
					}, function(err, device){
						done(err, device)
					})
				},

				function(device, done){
					if(!device){
						models.Device.create({
							deviceToken: req.body.deviceToken,
							deviceType: req.body.deviceType,
							deviceVersion: req.body.deviceVersion
						}, function(err, device){
							done(err, device)
						})
					} else {
						models.Device.update({
							_id: device._id
						}, {
							deviceToken: req.body.deviceToken,
							deviceType: req.body.deviceType,
							deviceVersion: req.body.deviceVersion,
							updated: new Date()
						}, function(err){
							done(err, device)
						})
					}
				},

				function(device, done){
					models.User.update({
						devices: device._id
					}, {
						$pull: { devices: device._id }
					}, {
						multi: true
					}, function(err, num){
						done(err, device)
					})
				},

				function(device, done){
					models.User.update({
						_id: req.user._id
					}, {
						$addToSet: { devices: device._id }
					}, function(err, num){
						done(err)
					})
				}


			], function(err){
				//Nothing to do here
			})


			// models.Device.find({
			// 	deviceToken: req.body.deviceToken
			// }, function(err, devices){

			// 	var foundDevice
			// 	devices.forEach(function(device){
			// 		if(device.user.toString() != req.user._id.toString()){
			// 			models.User.update({
			// 				_id: device.user
			// 			}, {
			// 				$pull: {
			// 					devices: device._id
			// 				}
			// 			}, function(err){
			// 				//Nothing to do
			// 			})
			// 			device.remove(function(err){
			// 				//nothing to do
			// 			})
			// 		} else {
			// 			foundDevice = device
			// 		}
			// 	})

			// 	if(!foundDevice){
			// 		req.body.user = req.user._id
			// 		models.Device.create(req.body,
			// 			function(err, device){
			// 				if(!err && device){
			// 					models.User.update({
			// 						_id: req.user._id
			// 					}, {
			// 						$addToSet: {
			// 							devices: device._id
			// 						}
			// 					})
			// 				}
			// 			})
			// 	} else {
			// 		foundDevice.update({
			// 			deviceType: req.body.deviceType,
			// 			deviceVersion: req.body.deviceVersion,
			// 			updated: new Date()
			// 		}, function(err){
			// 			// Don't need to do anything
			// 		})
			// 	}

			// })

			
			// models.Device.findOne({
			// 	deviceToken: req.body.deviceToken
			// }, function(err, device){

			// 	models.User.findOne(req.user._id).populate('devices').exec(function(err, user){
			// 		var foundDevice
			// 		user.devices.forEach(function(device){
			// 			if(req.body.deviceToken == device.deviceToken){
			// 				foundDevice = device
			// 			}
			// 		})

			// 		if(!foundDevice){
			// 			if(!err && device){
			// 				models.User.update({
			// 					devices: device._id
			// 				}, {
			// 					$pull: { devices: device._id }
			// 				}, function(err){
			// 					//Nothing to do
			// 				})
			// 			}

			// 			models.Device.create(req.body, function(err, savedDevice) {
			// 				if(!err && savedDevice){
			// 					models.User.update({
			// 						_id: req.user._id
			// 					}, {
			// 						$addToSet: {
			// 							devices: savedDevice._id
			// 						}
			// 					}, function(err){
			// 						// Don't need to do anything
			// 					})
			// 				}
			// 			});

			// 		} else {

			// 			foundDevice.update({
			// 				deviceType: req.body.deviceType,
			// 				deviceVersion: req.body.deviceVersion,
			// 				updated: new Date()
			// 			}, function(err){
			// 				// Don't need to do anything
			// 			})

			// 		}

			// 	})


			// })
			
		})

	users.route('/approvals')
		.get(app.auth, function(req, res){
			if(!req.user.hasPermission('users.approve')){
				res.send('You do not have permission to approve users', 403)
				return
			}

			models.User.find({
				applyingToBarId: req.user.barId,
				status: 'approvalRequired'
			}, function(err, users){
				if(err){
					res.send(err, 500)
				} else {
					var results = []
					users.forEach(function(user){
						results.push(user.json())
					})
					res.send(results)
				}
			})
		})

	users.route('/all')
		.get(app.auth, function(req, res){
			models.User.find({
				barId: req.user.barId
			})
				//.populate('badges')
				.exec(function(err, users){
					var results = []
					users.forEach(function(user){
						results.push(user.json())
					})

					res.send(results)
				})
		})

	users.route('/facebookPages')
		.get(app.auth, function(req, res){
			if(!req.user.facebookAccessToken){
				res.send('You do not have a facebook access token', 403)
			} else {
				graph.get('me/accounts?access_token=' + req.user.facebookAccessToken,
					function(err, result){
						if(err){
							res.send(err, 500)
						} else {
							res.send(result.data)
						}
					})
			}
		})
		.post(app.auth, function(req, res){
			if(!req.user.hasPermission('social.manage')){
				res.send("You do not have permission to manage your bar's social media", 403)
			} else if(!req.user.facebookAccessToken){
				res.send("You do not have a facebook access token", 403)
			} else {
				graph.get('me/accounts?access_token=' + req.user.facebookAccessToken,
					function(err, result){
						if(err){
							res.send(err, 500)
						} else {
							var foundPage
							result.data.forEach(function(page){
								if(page.id == req.body.id){
									foundPage = page
								}
							})

							if(!foundPage){
								res.send('No such page found', 404)
							} else {
								models.Bar.update({
									_id: req.user.barId
								}, {
									facebookPageId: foundPage.id,
									facebookPageAccessToken: foundPage.access_token
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
			}
		})

	users.route('/tips')
		.get(app.auth, function(req, res){
			res.send(req.user.tipsTriggered)
		})
		.post(app.auth, function(req, res){
			models.User.update({
				_id: req.user._id
			}, {
				$addToSet: {
					tipsTriggered: req.body.triggered
				}
			}, function(err){
				if(err){
					res.send(err, 500)
				} else {
					res.send(200)
				}
			})
		})

    // Handle changes from persistence sync library.
    users.route('/changes')
        .get(app.auth, function(req, res) {
            var checkTime = req.query.since;
            models.User.find({
                barId: req.user.barId
            }, function(err, users){
                var results = [];
                var now = new Date()
                users.forEach(function(user){
                    if (user.updated.getTime() >= checkTime) {
                        results.push(user.json())
                    }
                });

                res.json({
                    'now': now,
                    'updates': results
                });
            });
        })
        .post(app.auth, function(req, res) {
            var updates = req.body;
            if (util.isArray(updates)) {
                updates.forEach(function(update) {
                    models.User.findOne({
                        email: update.email
                    }, function(err, user){
                        if(err){
                            res.send(err, 500)
                        } else {
                            if (user) {
                                user.firstName = update.firstName;
                                user.lastName = update.lastName;
                                user.pictureURI = update.pictureURI;
                                user.role = update.role;
                                user.payRate = update.payRate;
                                user.status = update.status;
                                user.registrationStatus = update.registrationStatus;
                                user.updated = Date.now();
                                if (update._lastChange) {
                                    user._lastChange = update._lastChange;
                                } else {
                                    user._lastChange = Date.now();
                                }

                                    user.save(function(err, user) {
                                    if (err) {
                                        return console.error(err);
                                    }
                                });
                            } else {
                                console.error("Unable to find user with email: " + update.email);
                            }
                        }
                    });
                });
            }
            res.json({ 'status': 'ok', 'now': new Date().getTime() });
        });


	users.route('/:userId')
		//Update the user

		.put(app.auth, function(req, res){
			console.log("On server: "+req);
			async.waterfall([

				function(done){
					models.User.findOne({
						_id: req.params.userId
					}, function(err, user){
						if(err || !user){
							res.send(404, 'Could not find requested user')
							done('no user')
						} else {
							done(null, user)
						}
					})
				},

				//Check to see if the user CAN update this user
				//Is it his user, OR is he the owner/manager of the bar
				//this user belongs to?
				function(user, done){
					console.log("Profile name updating:");
					if(user._id.toString() != req.user._id.toString()){
						console.log("Profile name updating: 1");

						if( req.user.hasPermission('users.edit') &&
							req.user.barId.toString() == user.barId.toString()){
							done(null, user)
						} else {
							res.send(403, "You do not have access to modify this user")
							done("insufficent ownership")
						}
					} else {
						console.log("Profile name updating: 2");
						done(null, user)
					}
				},

				function(user, done){
					if(!req.files.image && !req.body.image){
						done(null, user)
					} else {
						uploadRoute(req, req.body.image, true, function(err, imageKey){
							if(err){
								res.send(err, 500)
								done(err)
							} else {
								user.pictureURI = imageKey
								done(null, user)
							}
						})
					}
				},

				//Check to see if the update is as recent as the last update time
				function(user, done){
					if(req.body.updated < user.updated){
						res.send(user)
						done("User has been updated since this update")
					} else {
						done(null, user)
					}
				},

				function(user, done){
					if(req.body.password){
						if(req.body.password.length < 8){
							res.send(500, 'Passwords must be at least 8 characters')
						} else {
							user.setPassword(req.body.password, function(err){
								if(err){
									res.send(500, err)
								} else {
									delete req.body.password
									done(null, user)
								}
							})
						}
					} else {
						done(null, user)
					}
				},

				//If we are changing the user's roles, change their permissions!
				function(user, done){
					if(req.body.role != user.role && !req.body.permissions){
						req.body.customPermissions = false
						models.Bar.findOne({
							_id: user.barId
						}, function(err, bar){
							if(err){
								done(err)
							} else if(!bar){
								done('No bar found')
							} else if(bar.roles && bar.roles[req.body.role]){
								req.body.permissions = bar.roles[req.body.role]
							} else {
								//Something is wrong-  give the user limited permissions!
								req.body.permissions = models.User.defaultStaffPermissions
							}
							done(null, user)
						})

					} else {
						if(req.body.permissions){
							req.body.customPermissions = true

							if(typeof req.body.permissions != 'object'){
								req.body.permissions = JSON.parse(req.body.permissions)
							}

							user.permissions = req.body.permissions
						}
						//No role change, move on
						done(null, user)
					}
				},

				//Update each attribute of the user as per req.body
				function(user, done){
					console.log("Profile name updating: 3");
					Object.keys(req.body).forEach(function(update){
						//Make sure that the update is actually a schema field for users
						if(models.User.editableFields.indexOf(update) != -1){
							console.log("Profile name updating: 4");
							user[update] = req.body[update]
						}
					})

					if(!req.body.updated){
						console.log("Profile name updating: 5");
						user.updated = new Date()
					}

					done(null, user)
				},

				function(user, done){
					user.save(function(err){
						if(err){
							res.send(500, err)
						} else {
							console.log("Profile name updating: 6");
							done(null, user)
						}
					})
				}

			], function(err, user){
				if(!err){
					console.log("Profile name updating: 7");
					res.send(user.json())
				}
			})
		})

		//Get User if allowed
		.get(app.auth, function(req, res){
			async.waterfall([

				function(done){
					models.User.findOne({
						_id: req.params.userId
					}, function(err, user){
						if(err || !user){
							res.send(404)
						} else {
							done(null, user)
						}
					})
				},

				function(user, done){
					if(user._id.toString() != req.user.id.toString()){
						if( req.user.hasPermission('users.read') &&
							req.user.barId.toString() == user.barId.toString()){

							done(null, user)
						} else {
							res.send(403)
							done("Not authorized")
						}
					} else {
						done(null, user)
					}
				}

			], function(err, user){
				if(!err){
					res.send(user.json(['shared']))
				}
			})
		})

	users.route('/:userId/deactivate')
		.delete(app.auth, function(req, res){
			if(!req.user.hasPermission('users.deactivate')){
				res.send(403)
				return
			}

			models.User.findOne({
				barId: req.user.barId,
				_id: models.ObjectId(req.params.userId)
			}, function(err, user){
				if(err){
					res.send(500)
				} else if(!user){
					console.log("error Message"+err+" req.user.barId "+req.user.barId+" req.params.userId "+req.params.userId );
					res.send(404)
				} else {
					user.status = 'deactivated'
					user.locked = true;
					if(!user.pastBars){
						user.pastBars = []
					}
					user.pastBars.push(user.applyingToBarId)
					user.barId = null
					user.applyingToBarId = null
					user.save(function(err){
						if(err){
							res.send(err, 500)
						} else {
							res.send(200)
						}
					})
				}
			})
		})

	users.route('/:userId/approve')
		.put(app.auth, function(req, res){
			if(!req.user.hasPermission('users.approve')){
				res.send('You do not have permission to approve users', 403)
				return
			}

			models.User.findOne({
				_id: models.ObjectId(req.params.userId),
				applyingToBarId: req.user.barId
			})
				.populate('applyingToBarId')
				.exec(function(err, user){
					if(err){
						res.send(err, 500)
					} else if(!user){
						res.send(404)
					} else {
						user.status = 'active'
						user.barId = req.user.barId
						user.registrationStatus.approved = true
						user.save(function(err){
							if(err){
								res.send(err, 500)
							} else {
								res.send(user.json())

								//Let the user know they've been approved
								pushNotification(user._id,
									req.user.firstName + ' ' + req.user.lastName + ' has approved you to join ' + user.applyingToBarId.name,
									function(err){
									//Do nothing at this point
									}
								)
							}
						})
					}
				})
		})

	users.route('/:userId/permissions')
		.get(app.auth, function(req, res){
			models.User.findOne({
				_id: req.params.userId
			}, function(err, user){
				if(err){
					res.send(err, 500)
				} else if(!user){
					res.send(404)
				} else if(user.barId.toString() != req.user.barId.toString() ||
					!req.user.hasPermission('users.read')){
					res.send(403)
				} else {
					res.send(user.permissions)
				}
			})
		})

	return users

}
