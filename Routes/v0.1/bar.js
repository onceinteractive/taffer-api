var express = require('express')

module.exports = function(app, models){

	var bars = express.Router()

	bars.route('/')
		//Get my bar
		.get(app.auth, function(req, res){
			models.Bar.findOne({
				_id: req.user.barId
			}, function(err, bar){
				if(err){
					res.send(err, 500)
				} else if(!bar){
					res.send('No such bar found', 404)
				} else {
					//res.send(bar.json())
					var result = bar.json()
					// get the user and check facebook credentials
					models.User.findOne({
						_id: models.ObjectId(result.ownerId)
					}, function(err, user) {
						if (err || !user) {
							res.send(err, 500)
						} else {
							if(user.facebookAccessToken && user.facebookUserId) {
								result.facebook = true
							}
							res.send(result)
						}
					})
				}
			})
		})

		//Create a new bar
		.post(app.auth, function(req, res){
			//Validate that the user is of the proper type
			if(req.user.role.toLowerCase() != 'owner'){
				res.send('Only admin users can create bars', 403)
				return
			}
			//Validate that the user does not already own/belong to a bar
			if(req.user.barId){
				res.send('User is already assigned to bar ' + req.user.barId, 403)
				return
			}

			//Validate that we have all prequisite information required to create a bar
			var failedValidation = false
			models.Bar.requiredAttributes.forEach(function(attribute){
				if(!req.body[attribute]){
					failedValidation = true
				}
			})
			Object.keys(req.body).forEach(function(attribute){
				if(models.Bar.requiredAttributes.indexOf(attribute) == -1){
					failedValidation = true
				}
			})
			if(failedValidation){
				res.send('This endpoint requires the following and only the following attributes: ' + models.Bar.requiredAttributes)
				return
			}

			//Make sure that the category is set to an acceptable category
			if(models.Bar.categoriesList.indexOf(req.body.category) == -1){
				res.send('The only allowed categories allowed are ' + models.Bar.categoriesList, 500)
				return
			}

			//Add the default role setup
			req.body.roles = {}
			models.Bar.defaultRoles.forEach(function(role){
				if(role.permissions == 'admin'){
					req.body.roles[role.position] = models.User.defaultAdminPermissions
				} else if(role.permissions == 'manager'){
					req.body.roles[role.position] = models.User.defaultManagerPermissions
				} else {
					req.body.roles[role.position] = models.User.defaultStaffPermissions
				}
			})

			//Add the user as the owner of the bar
			req.body.ownerId = req.user._id

			//Finally - create a bar

			models.Bar.create(req.body, function(err, bar){
				if(err || !bar){
					res.send(err, 500)
				} else {
					bar.generateCode(function(err, bar){
						if(err){
							res.send(err)
						} else {
							res.send(bar.json())
						}
					})
				}
			})

		})

	//Update when you don't have the barID - such as registration process
	.put(app.auth, function(req, res){
			if(!req.user.hasPermission('bars.edit')){
				res.send(403)
				return
			}

			models.Bar.findOne({
				_id: models.ObjectId(req.user.barId)
			}, function(err, bar){
				if(err){
					res.send(err, 500)
				} else if(!bar){
					res.send(404)
				} else {
					var editableFields = ['name', 'streetAddress', 'city', 'zipcode', 'state', 'category']

					editableFields.forEach(function(field){
						if(req.body[field]){
							bar[field] = req.body[field]
						}
					})

					bar.save(function(err){
						if(err){
							res.send(err, 500)
						} else {
							res.send(bar.json())
						}
					})
				}
			})

		})

	//Return a list of acceptable bar types
	bars.route('/types')
		.get(function(req, res){
			res.send(models.Bar.categoriesList)
		})

	// bars.route('/survey')
	// 	.get(app.auth, function(req, res){
	// 		models.Bar.findOne({
	// 			_id: req.user.barId
	// 		}, function(err, bar){
	// 			if(err){
	// 				res.send(err, 500)
	// 			} else if(!bar){
	// 				res.send(404)
	// 			} else {
	// 				console.log(bar)
	// 				res.send(bar.surveyAnswers)
	// 			}
	// 		})
	// 	})

	bars.route('/code/new')
		.post(app.auth, function(req, res){
			if(!req.user.hasPermission('bars.edit')){
				res.send(403)
				return
			}

			models.Bar.findOne({
				_id: req.user.barId
			}, function(err, bar){
				if(err){
					res.send(err, 500)
				} else if(!bar){
					res.send(404)
				} else {
					bar.generateCode(function(err, bar){
						if(err){
							res.send(err, 500)
						} else {
							res.send(bar.json())
						}
					})
				}
			})
		})

	bars.route('/code/:code')
		.get(app.auth, function(req, res){

			models.Bar.findOne({
				code: req.params.code
			}, function(err, bar){
				if(err){
					res.send(err, 500)
				} else if(!bar){
					res.send('No bar by this code found', 404)
				} else {
					res.send(bar)
				}
			})

		})

	bars.route('/:barId')
		.put(app.auth, function(req, res){
			if(req.params.barId != req.user.barId.toString() ||
				!req.user.hasPermission('bars.edit')){
				res.send(403)
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
					var editableFields = ['name', 'streetAddress', 'city', 'zipcode', 'state', 'category']

					editableFields.forEach(function(field){
						if(req.body[field]){
							bar[field] = req.body[field]
						}
					})

					bar.save(function(err){
						if(err){
							res.send(err, 500)
						} else {
							res.send(bar.json())
						}
					})
				}
			})

		})

	return bars

}
