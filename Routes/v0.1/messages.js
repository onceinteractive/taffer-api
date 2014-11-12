var express = require('express')
var async = require('async')


module.exports = function(app, models){

	var messages = express.Router()
	var uploadRoute = require('../../Modules/imageUpload')(models)
	var pushNotification = require('../../Modules/pushNotifications')(app, models);

	messages.route('/')
		//Get all messages
		.get(app.auth, function(req, res){
			models.MessageThread.find({
				barId: req.user.barId,
				participants: req.user._id
			}, function(err, messageThreads){
				if(err){
					res.send(err, 500)
				} else if(!messageThreads){
					res.send([])
				} else {
					var threads = []
					async.each(messageThreads, function(messageThread, done){
						messageThread.json(req.user._id, function(err, thread){
							if(!err){

								if(thread.hidden && thread.hidden[req.user._id] &&
										thread.hidden[req.user._id].getTime() > thread.messages[0].sentOn.getTime()){
										// Don't add the hidden on to the object
								} else {
										threads.push(thread)
								}
							}
							done(err)
						})
					}, function(err){
						if(err){
							res.send(err, 500)
						} else {
							threads.sort(function(a, b){

								//These two cases should never occur
								if(!a.messages || !b.messages){
									return 0
								} else if(a.messages.length == 0 ||
									b.messages.length == 0){
									return 0
								}

								if(a.messages[a.messages.length - 1].sentOn >
									b.messages[b.messages.length - 1].sentOn){
										return 1
								} else {
									return -1
								}
							})

							res.send(threads)
						}
					})
				}
			})
		})

		//Post a new message
		/*
			Example Post:
			{
				to: [Strings] - multiple user ids
				message: message,
			}
			FILES:
			image: the image that is being uploaded
		*/
		.post(app.auth, function(req, res){
			if(!req.body || !req.body.to){
				res.send(412)
				return
			}

			async.waterfall([

				function(done){
					req.user.whoCanMessage(function(err, users){
						var canSend = true
						var recipients = []

						req.body.to.forEach(function(to){
							var found

							users.forEach(function(user){
								if(user._id.toString() == to){
									found = true
									recipients.push(user._id)
								}
							})

							if(!found){
								canSend = false
							}
						})

						if(!canSend){
							done({
								response: 'You are not allowed to message one of these users',
								status: 403
							})
						} else {
							done(null, recipients)
						}
					})
				},

				function(recipients, done){
					if(req.files.image || req.body.image){
						uploadRoute(req, req.body.image, function(err, imageKey){
							if(err){
								done({
									response: err,
									status: 500
								})
							} else {
								done(null, recipients, imageKey)
							}
						})
					} else {
						done(null, recipients, null)
					}
				},

				function(recipients, imageKey, done){
					recipients.push(req.user._id)

					models.MessageThread.create({
						barId: req.user.barId,
						participants: recipients
					}, function(err, thread){
						if(err){
							done({
								response: err,
								status: 500
							})
						} else {
							done(null, thread, imageKey)
						}
					})
				},

				function(thread, imageKey, done){
					models.Message.create({
						threadId: thread._id,
						from: req.user._id,
						message: req.body.message,
						imageKey: imageKey,
						sentOn: new Date()
					}, function(err, message){
						if(err){
							done({
								response: err,
								status: 403
							})
						} else {
							done(null, thread, message)
						}
					})
				},

				function(thread, message, done){
					thread.update({
						$push: {
							messages: message._id
						}
					}, function(err){
						if(err){
							done({
								response: err,
								status: 500
							})
						} else {
							done(null, thread, message)
						}
					})
				}

			], function(err, thread){
				if(err){
					res.send(err.response, err.status)
				} else {
					thread.json(req.user._id, function(err, result){
						if(err){
							res.send(err, 500)
						} else {
							res.send(result)
						}
					})

					var pushRecipients = []
                    console.log("to1:"+thread.participants.toString());
					thread.participants.forEach(function(participant){
						if(participant.toString() != req.user._id){
							pushRecipients.push(participant)
							pushNotification(participant,
								pushMessage,
								'Main.Messages.List',
								function(err){
									//Nothing to do here regardless
								}
							)
						}
					})


					var pushMessage = req.user.firstName + ' ' + req.user.lastName + ' - ' + req.body.message.substring(0, 80)
					if(req.body.message.length > 80){
						pushMessage = pushMessage + '...'
					}

					pushNotification(pushRecipients,
						pushMessage,
						'Main.Messages.List',
						function(err){
							//Nothing to do here regardless
						}
					)
				}
			})
		})

	messages.route('/whocanimessage')
		.get(app.auth, function(req, res){
			req.user.whoCanMessage(function(err, users){
				var canMessage = []

				users.forEach(function(user){
					canMessage.push(user.json())
				})

				res.send(canMessage)
			})
		})

	messages.route('/:threadId')
		.get(app.auth, function(req, res){
			models.MessageThread.findOne({
				_id: req.params.threadId
			}, function(err, messageThread){
				messageThread.json(req.user._id, function(err, results){
					if(err){
						res.send(err, 500)
					} else {
						res.send(results)
					}
				})
			})
		})

		/*
			Example POST:
			{
				message: String
			},
			OPTIONAL:
			files.image -> image
		*/
		.post(app.auth, function(req, res){
			models.MessageThread.findOne({
				_id: req.params.threadId
			})
				.populate('Message')
				.exec(function(err, messageThread){
					if(err){
						res.send(err, 500)
					} else if(!messageThread){
						res.send(404)
					} else if(messageThread.participants.indexOf(req.user._id) == -1){
						res.send(403)
					} else {
						async.waterfall([

							function(done){
								if(req.files.image || req.body.image){
									uploadRoute(req, req.body.image, function(err, imageKey){
										done(err, imageKey)
									})
								} else {
									done(null, null)
								}
							},

							function(imageKey, done){
								models.Message.create({
									message: req.body.message,
									imageKey: imageKey,
									from: req.user._id,
									sentOn: new Date(),
									threadId: messageThread._id
								}, function(err, message){
									done(err, message)
								})
							},

							function(message, done){
								messageThread.update({
									$push: {
										messages: message
									}
								}, function(err){
									done(err)
								})
							},

							function(done){
								models.MessageThread.findOne({
									_id: messageThread._id
								})
									.populate('messages')
									.exec(function(err, messageThread){
										done(err, messageThread)
									})
							}

						], function(err, messageThread){
							if(err){
								res.send(err, 500)
							} else {
								messageThread.json(req.user._id, function(err, thread){
									if(err){
										res.send(err, 500)
									} else {
										res.send(thread)
									}
								})
							}
						})
					}
				})
		})

	//Read receipt endpoint
	//Note: Yes, I know this is not transaction safe. To be fixed?
	messages.route('/:threadId/read')
		.post(app.auth, function(req, res){
			models.MessageThread.findOne({
				_id: models.ObjectId(req.params.threadId)
			}, function(err, thread){
				if(err){
					res.send(err, 500)
				} else if(!thread){
					res.send(404)
				} else if(thread.participants.indexOf(req.user._id) == -1){
					res.send(403)
				} else {
					if(!thread.read){
						thread.read = {}
					}
					thread.read[req.user._id] = new Date()
					models.MessageThread.update({
						_id: thread._id
					}, {
						$set: {
							read: thread.read
						}
					}, function(err){
						//Nothing to do
					})

					res.send(200)
				}

			})
		})

	//Hidden endpoint
	//Note: Yes, I know this is not transaction safe. To be fixed?
	messages.route('/:threadId/hidden')
		.post(app.auth, function(req, res){
			models.MessageThread.findOne({
				_id: models.ObjectId(req.params.threadId)
			}, function(err, thread){
				if(err){
					res.send(err, 500)
				} else if(!thread){
					res.send(404)
				} else if(thread.participants.indexOf(req.user._id) == -1){
					res.send(403)
				} else {
					if(!thread.hidden){
						thread.hidden = {}
					}
					thread.hidden[req.user._id] = new Date()
					models.MessageThread.update({
						_id: thread._id
					}, {
						$set: {
							hidden: thread.hidden
						}
					}, function(err){
						//Nothing to do
					})

					res.send(200)
				}

			})
		})

	return messages

}
