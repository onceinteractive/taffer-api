var express = require('express')

module.exports = function(app, models){

	var pushNotificationRouter = express.Router()
	var pushNotification = require('../Modules/pushNotifications')(app, models);

	pushNotificationRouter.route('/user/:userId')
		.post(app.adminAuth, function(req, res){
			if(!req.adminUser.hasPermission('pushNotifications.users')){
				res.send(403)
				return
			}

			if(!req.body.message){
				res.send(512)
			}

			models.User.findOne({
				_id: models.ObjectId(req.params.userId)
			}, function(err, user){
				if(err){
					res.send(err, 500)
				} else if(!user){
					res.send(404)
				} else {
					pushNotification(user._id,
						req.body.message,
						function(err){
							if(err){
								res.send(err, 500)
							} else {
								res.send(200)
							}
						}
					)
				}
			})

		})	

	pushNotificationRouter.route('/bar/owner/:barId')
		.post(app.adminAuth, function(req, res){
			if(!req.adminUser.hasPermission('pushNotifications.users')){
				res.send(403)
				return
			}

			if(!req.body.message){
				res.send(512)
				return
			}

			models.Bar.findOne({
				_id: models.ObjectId(req.params.barId)
			}, function(err, bar){
				if(err){
					res.send(err, 500)
				} else if(!bar){
					res.send(404)
				} else {
					if(bar.ownerId){
						pushNotification(bar.ownerId,
							req.body.message,
							function(err){
								if(err){
									res.send(err, 500)
								} else {
									res.send(200)
								}
							}
						)
					} else {
						res.send('No bar owner', 404)
					}
				}
			})
		})

	pushNotificationRouter.route('/bar/users/:barId')
		.post(app.adminAuth, function(req, res){
			if(!req.adminUser.hasPermission('pushNotifications.users')){
				res.send(403)
				return
			}

			if(!req.body.message){
				res.send(512)
				return
			}

			models.User.find({
				_id: models.ObjectId(req.params.barId)
			}, function(err, users){
				if(err){
					res.send(err, 500)
				} else if(!users || users.length == 0){
					res.send(404)
				} else {
					var userIds = []

					users.forEach(function(user){
						userIds.push(user._id)
					})

					pushNotification(userIds,
						req.body.message,
						function(err){
							if(err){
								res.send(err, 500)
							} else {
								res.send(200)
							}
						}
					)
				}
			})
		})

	pushNotificationRouter.route('/bulk')
		.post(app.adminAuth, function(req, res){
			if(!req.adminUser.hasPermission('pushNotifications.bulk')){
				res.send(403)
				return
			}

			if(!req.body.query || !req.body.message){
				res.send(412)
				return
			}

			models.User.find(query, function(err, users){
				if(err){
					res.send(err, 500)
				} else{
					var userIds = []
					users.forEach(function(user){
						userIds.push(user._id)
					})

					pushNotification(userIds,
						req.body.message,
						function(err){
							if(err){
								res.send(err, 500)
							} else {
								res.send(200)
							}
						}
					)
				}
			})
		})

	return pushNotificationRouter

}
