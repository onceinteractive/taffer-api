var express = require('express')
var async = require('async')

module.exports = function(app, models){

	var register = express.Router()
	var pushNotification = require('../../Modules/pushNotifications')(app, models)

	//General usage functon within this route -
	//update the user object's registration status
	var updateRegistrationStatus = function(user, cb){
		async.waterfall([

			//Reload the user, just in case.
			function(done){
				models.User.findOne({
					_id: user._id
				}, function(err, user){
					if(err){
						done(err)
					} else {
						done(null, user)
					}
				})
			},

			function(user, done){
				var updatedRegistrationStatus = user.registrationStatus

				//Has the bar id been set? If so, then
				//set the bar registrationStatus to true
				if(user.barId && !user.registrationStatus.bar){
					user.registrationStatus.bar = true
				}

				//Why the update var? Because complex JSON objects don't work with the
				var update = {}

				//Go through the attributes of the registrationStatus,
				//and see if there is any we need to update
				Object.keys(user.registrationStatus)
					.forEach(function(attribute){
						if(attribute == 'bar'){
							return
						} else if(!user.registrationStatus[attribute] &&
							user[attribute]){
							updatedRegistrationStatus[attribute] = true
						}
						update['registrationStatus.' + attribute] = updatedRegistrationStatus[attribute]
					})

				user.update(update, function(err){
					done(err, user)
				})

			}

		], function(err, user){
			cb(err, user)
		})
	}

	//Primary user registration pieces
	register.route('/user')
		.post(app.auth, function(req, res){
			async.waterfall([

				//Is the user already registered
				function(done){
					if(req.user.status != 'registering'){
						done({
							response: 'User is already fully registered',
							status: 403
						})
					} else {
						done(null)
					}
				},

				//Go through the update, and update the user accordingly
				function(done){
					Object.keys(req.body).forEach(function(attribute){
						//Make sure the user attribute is actually an attribue within the schema
						if(Object.keys(req.user.schema.paths).indexOf(attribute) == -1){
							//Ignore the offending attribute
							return
						}
						req.user[attribute] = req.body[attribute]

						//If we're setting the role, set default permissions too
						if(attribute == 'role'){
							if(req.user.role == 'admin'){
								req.user.permissions = models.User.defaultAdminPermissions
								req.user.role = 'Owner'
							} else {
								req.user.permissions = models.User.defaultStaffPermissions
							}
						}
					})

					//Once we're done, save the user and move on
					req.user.save(function(err, user){
						if(err){
							done({
								status: 500,
								response: err
							})
						} else {
							done(null, user)
						}
					})
				},

				//Update the user object's registration status
				function(user, done){
					updateRegistrationStatus(user, function(err, user){
						done(null, user)
					})
				}

			], function(err, user){
				if(err){
					res.send(err.response, err.status)
				} else {
					res.send(user.json(), 200)
				}
			})
		})

	//Initial user image upload
	var uploadRoute = require('../../Modules/imageUpload')(models)
	register.route('/image')
		.post(app.auth, function(req, res){
			uploadRoute(req, req.body.image, true, function(err, imageKey){
				if(err){
					res.send(err.response, err.status)
				} else {
					req.user.update({
						pictureURI: imageKey
					}, function(err, user){
						updateRegistrationStatus(req.user, function(err, user){
							res.send(user.json())
						})
					})
				}
			})
		})

	//Initial bar subscription - for bar employees only
	register.route('/bar/:code')
		.post(app.auth, function(req, res){

			models.Bar.findOne({
				code: req.params.code
			}, function(err, bar){
				if(err){
					res.send(err, 500)
				} else if(!bar){
					res.send('No bar by this code found', 404)
				} else {
					if(req.user.pastBars){
						var deactivatedFromBar = false
						req.user.pastBars.forEach(function(barId){
							if(barId.toString == bar._id.toString()){
								deactivatedFromBar = true
							}
						})
						if(deactivatedFromBar){
							res.send('You can not reapply to the same bar after being deactivated', 403)
							return
						}
					}

					if(bar.blockedApproval
						&& bar.blockedApproval.length > 0){
						var isBlocked
						bar.blockedApproval.forEach(function(blockedUserId){
							if(blockedUserId.toString() == req.user._id.toString()){
								isBlocked = true
							}
						})
						if(isBlocked){
							res.send('You have been blocked from applying to this bar', 403)
							return
						}
					}

					req.user.update({
						applyingToBarId: bar._id
					}, function(err){
						if(err){
							res.send(err, 500)
						} else {
							updateRegistrationStatus(req.user, function(err, user){
								if(err){
									res.send(err, 500)
								} else {
									res.send(user.json())
								}
							})
						}
					})
				}
			})

		})

	//An endpoint to denote that the user has complete registration and needs to be approved
	register.route('/complete')
		.post(app.auth, function(req, res){
			if(req.user.applyingToBarId){
				
				models.Bar.findOne({
					_id: req.user.applyingToBarId
				}, function(err, bar){
					if(err || !bar){
						res.send(err, 500)
						return
					}

					if(bar.blockedApproval
						&& bar.blockedApproval.length > 0){
						var isBlocked
						bar.blockedApproval.forEach(function(blockedUserId){
							if(blockedUserId.toString() == req.user._id.toString()){
								isBlocked = true
							}
						})
						if(isBlocked){
							res.send('You have been blocked from applying to this bar', 403)
							return
						}
					}

					req.user.update({
						status: 'approvalRequired'
					}, function(err){
						if(err){
							res.send(err, 500)
						} else {
							res.send(req.user.json())

							models.User.find({
								$and: [
									{
										barId: bar._id,
										'permissions.users.approve': true
									},
									{ $or: [ { locked: false }, { locked: false }] }
								]
							}, function(err, users){
								if(err){
									//Can't do much here
									return
								}

								var userIds = []
								users.forEach(function(user){
									userIds.push(user._id)
								})

								//Push notification approval process
								pushNotification(userIds,
									req.user.firstName + ' ' + req.user.lastName + ' has requested to join your Bar Network',
									'Main.MyTeam.List',
									function(err){
									//Do nothing at this point
									}
								)
							})

						}
					})

				})

			} else {
				models.User.update({
					_id: req.user._id
				}, {
					status: 'active'
				}, function(err){
					if(err){
						res.send(err, 500)
					} else {
						res.send(200)
					}
				})
			}

			
		})



	return register

}
