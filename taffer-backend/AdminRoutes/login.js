var uuid = require('node-uuid')

var express = require('express')

module.exports = function(app, models){

	var login = express.Router()

	login.route('/')

		.post(function(req, res){
			if(!req.body || !req.body.email || !req.body.password){
				res.send(401)
			} else {
				models.Admin.findOne({
					email: req.body.email.toLowerCase()
				}, function(err, admin){
					if(err || !admin){
						res.send(401)
					} else {
						
						admin.authenticatePassword(req.body.password, function(err, result){
							if(err){
								res.send(401)
							} else if(!result){
								res.send(401)
							} else {

								res.cookie('id', admin._id, { signed: true })
								var token = uuid.v4()
								res.cookie('token', token, { signed: true })

								admin.update({
									sessionToken: token,
									lastLogin: new Date()
								}, function(err){
									if(err){
										res.send(401)
									} else {
										res.send(admin.json())
									}
								})
							}
						})

					}
				})
			}
		})

		['delete'](app.adminAuth, function(req, res){
			res.clearCookie('id')
			res.clearCookie('token')
			req.admin.update({
				sessionToken: uuid.v4()
			}, function(err){
				res.send(200)
			})

		})

	return login

}