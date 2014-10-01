var express = require('express')
var async = require('async')

module.exports = function(app, models){

	var roles = express.Router()

	roles.route('/')
		.get(app.auth, function(req, res){
			models.Bar.findOne({ _id: req.user.barId }, function(err, bar){
				if(err){
					res.send(err, 500)
				} else if(!bar){
					res.send('No bar found by this id', 404)
				} else {
					res.send(bar.roles)
				}
			})
		})

		//Allow creation and modification of all permissions through here
		.post(app.auth, function(req, res){
			if(req.user.hasPermission('users.permissions')){
				res.send('This user can not access user permissions', 403)
				return
			}

			models.Bar.find({ _id: req.user.barId }, function(err, bar){
				if(err){
					res.send(err, 500)
					return
				} else if(!bar){
					res.send('No bar found by this id', 404)
					return
				}

				if(!bar.roles){
					bar.roles = {}
				}
				bar.roles[req.body.role] = req.body.permissions

				bar.save(function(err){
					if(err){
						res.send(err, 500)
					} else {
						res.send(bar.roles)

						//Now update all the user's permissions
						//that have that role
						models.User.update({
							barId: bar._id,
							role: req.body.role,
							customPermissions: false
						}, {
							permissions: bar.roles[req.body.role]
						}, {
							multi: true
						} , function(err){

						})

					}
				})

			})


		})


	return roles

}
