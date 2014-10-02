var express = require('express')
var async = require('async')
var uuid = require('node-uuid')

module.exports = function(app, models){

	var users = express.Router()

	users.route('/')

		//Search
		/*
			Directly search off of req.query
		*/
		.get(app.adminAuth, function(req, res){

			Object.keys(req.query).forEach(function(query){
				req.query[query] = new RegExp('^'+ req.query[query] +'$', "i")
			})

			models.User.find(req.query, function(err, users){
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


	users.route('/:userId')

		//Update the user
		.put(app.adminAuth, function(req, res){
			if(!req.admin.hasPermission('users.edit')){
				res.send("403")
				return
			}

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

				function(user, done){
					if(req.body.password){
						user.setPassword(req.body.password, function(err){
							if(err){
								res.send(500, err)
							} else {
								// delete req.body.password
								done(null, user)
							}
						})
					} else {
						done(null, user)
					}
				},

				//Update each attribute of the user as per req.body
				function(user, done){
					Object.keys(req.body).forEach(function(update){
						if(update != 'password'){
							user[update] = req.body[update]
						}
					})

					if(!req.body.updated){
						user.updated = new Date()
					}

					done(null, user)
				},

				//If we are changing the user's roles, change their permissions!
				function(user, done){
					if(req.body.role){

						models.Bar.find({
							_id: user.barId
						}, function(err, bar){
							if(bar.permissions && bar.permissions[req.body.role]){
								user.permissions = bar.permissions[req.body.role]
							} else {
								//Something is wrong-  give the user limited permissions!
								user.permissions = models.User.defaultStaffPermissions
							}
						})

					} else {
						//No role change, move on
						done(null, user)
					}
				},

				function(user, done){
					user.save(function(err){
						if(err){
							res.send(500, err)
						} else {
							done(null, user)
						}
					})
				}

			], function(err, user){
				if(!err){
					res.send(user.json())
				}
			})
		})

		//Get User if allowed
		.get(app.adminAuth, function(req, res){
			if(!req.admin.hasPermission('users.read')){
				res.send("403")
				return
			}

			models.User.findOne({
				_id: req.params.userId
			}, function(err, user){
				if(err || !user){
					res.send(404)
				} else {
					res.send(user)
				}
			})
		})

	return users

}
