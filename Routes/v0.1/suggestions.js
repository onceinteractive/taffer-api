var express = require('express')

module.exports = function(app, models){

	var suggestions = express.Router()

	var pushNotification = require('../../Modules/pushNotifications')(app, models);

	suggestions.route('/')

		//Get all suggestions
		.get(app.auth, function(req, res){
			//See if the user has access to read
			//the suggestion box
			if(!req.user.hasPermission('suggestionBox.read')){
				res.send('You do not have permission to read the suggestion box', 403)
				return
			}

			models.Bar.findOne({
				_id: models.ObjectId(req.user.barId)
			})
			.populate('suggestions')
			.exec(function(err, bar){
				if(err){
					res.send(err, 500)
				} else {
					var suggestions = []
					bar.suggestions.forEach(function(suggestion){
						if(!suggestion.hidden){
							//Hide the poster
							suggestion.by = null
							suggestions.push(suggestion)
						}
					})

					suggestions.sort(function(a, b){
						if(a.created > b.created){
							return 1
						} else if(a.created < b.created){
							return -1
						} else {
							return 0
						}
					})

					res.send(suggestions)
				}
			})
		})

		//Create a new suggestion
		/*
			{
				message: String
			}
		*/
		.post(app.auth, function(req, res){
			models.Suggestion.create({
				message: req.body.message,
				by: req.user._id
			}, function(err, suggestion){
				if(err){
					res.send(err, 500)
				} else {
					models.Bar.update({
						_id: models.ObjectId(req.user.barId)
					}, {
						$push: {
							suggestions: suggestion._id
						}
					}, function(err){
						if(err){
							res.send(err, 500)
						} else {
							res.send(suggestion)

							//Send the push notifications on suggestions
							models.User.find({
								barId: req.user.barId,
								'permissions.suggestionBox.read': true
							}, function(err, users){
								if(!err && users && users.length > 0){
									var pushRecipients = []

									users.forEach(function(user){
										pushRecipients.push(user._id)
									})

									pushNotification(pushRecipients,
										"A new suggestion has been sent.",
										'Main.Messages.List',
										function(err){
											//Nothing to do here regardless
										}
									)
								}
							})

						}
					})
				}
			})
		})

	suggestions.route('/:suggestionId')
		.get(app.auth, function(req, res) {

			if(!req.user.hasPermission('suggestionBox.read')){
				res.send('You do not have permission to read the suggestion box', 403)
				return
			}

			models.Suggestion.findOne({_id: req.params.suggestionId}, function(err, suggestion) {
				if(err) {
					res.send(500, err);
				} else {
					res.send(suggestion);
				}
			});
		})
		.delete(app.auth, function(req, res){
			if(!req.user.hasPermission('suggestionBox.read')){
				res.send('You do not have permission to modify the suggestion box', 403)
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
					var foundSuggestion
					if(!bar.suggestions){
						bar.suggestions = []
					}
					bar.suggestions.forEach(function(suggestion){
						if(req.params.suggestionId == suggestion.toString()){
							foundSuggestion = suggestion
						}
					})

					if(!foundSuggestion){
						res.send(404)
					} else {
						models.Suggestion.update({
							_id: req.params.suggestionId
						}, {
							hidden: true
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


	return suggestions

}
