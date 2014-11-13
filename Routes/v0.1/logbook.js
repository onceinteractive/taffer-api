var express = require('express')
var async = require('async')

module.exports = function(app, models){

	var logbook = express.Router()

	var uploadRoute = require('../../Modules/imageUpload')(models)
	var pushNotification = require('../../Modules/pushNotifications')(app, models);


	logbook.route('/')
		//Get the last three days of logbook entries/threads
		.get(app.auth, function(req, res){

			//Determine if the user has access to the logbooks
			if(!req.user.hasPermission('logbooks.read')){
				res.send('You do not have permission to read the logbooks', 403)
				return
			}

			models.LogThread.find({
				barId: req.user.barId,
				created: { $gte: (3).days().ago() }
			})
			.populate('entries')
			.exec(function(err, logThreads){
				if(err){
					res.send(err, 500)
				} else {
					models.LogThread.generateLogBook(logThreads, function(err, logbook){
						if(err){
							res.send(err, 500)
						} else {
							res.send(logbook)
						}
					})
				}
			})

		})

		//Create a new logbook thread
		/*
			Example post:
			title: Title of the entry
			priortiy: true or false. OPTIONAL True will send push notifications
			message: Message text
			image: Image upload (OPTIONAL)
		*/
		.post(app.auth, function(req, res){

			//Make sure the user has the ability to write
			//to the logbooks
			if(!req.user.hasPermission('logbooks.write')){
				res.send('You do not have permission to write to the logbooks', 403)
				return
			}

			async.waterfall([

				//Deal with the uploaded image
				function(done){
					if(!req.files.image && !req.body.image){
						done(null, null)
					} else {
						uploadRoute(req, req.body.image, function(err, imageKey){
							if(err){
								done({
									response: err,
									code: 500
								})
							} else {
								done(null, imageKey)
							}
						})
					}
				},

				//Create the new log thread
				function(imageKey, done){

					models.LogThread.create({
						barId: req.user.barId,
						title: req.body.title,
						priority: req.body.priority,
					}, function(err, logThread){
						if(err){
							done({
								response: err,
								code: 500
							})
						} else {
							done(null, imageKey, logThread)
						}
					})

				},

				//Create the log entry now
				function(imageKey, logThread, done){
					models.LogEntry.create({
						barId: req.user.barId,
						logThread: logThread._id,
						message: req.body.message,
						imageKey: imageKey,
						by: req.user._id
					}, function(err, logEntry){
						if(err){
							done({
								response: err,
								code: 500
							})
						} else {
							done(null, logThread, logEntry)
						}
					})
				},

				//Append the log entry to the thread
				function(logThread, logEntry, done){
					logThread.update({
						$push: { entries: logEntry._id }
					}, function(err){
						// logEntry.entries = [logEntry]
						done(null, logThread)
					})
				},

				function(logThread, done){
					models.LogThread.findOne({
						_id: logThread._id
					})
						.populate('entries')
						.exec(function(err, logThread){
							if(err){
								done(err)
							} else if(!logThread){
								done('Error while repopulating the logthread')
							} else {
								models.LogThread.generateLogBook([logThread], function(err, logbook){
									if(err){
										done(err)
									} else if(!logbook || logbook.length == 0){
										done('Error while repopulating the logthread')
									} else {
										done(null, logThread, logbook[0])
									}
								})
							}
						})
				},


				function(logThread, logbook, done){
					if(req.body.priority){

						models.User.find({
							barId: req.user.barId,
							'permissions.logbooks.read': true
						}, function(err, users){
							if(err || !users){
								//nothing we can do
								return
							}

							var pushRecipients = []
							users.forEach(function(participant){
								if(participant.toString() != req.user._id){
									pushRecipients.push(participant)
									pushNotification(participant,
										req.user.firstName + ' ' + req.user.lastName + ' has added a High Priority Item to the Logbook' ,
										'Main.LogBook.List',
										function(err){
											//Nothing to do
										}
									)
								}
							})


						})
					}

					done(null, logbook)
				}

			], function(err, logThread){
				if(err){
					res.send(err.response, err.code)
				} else {
					res.send(logThread)
				}
			})

		})

	//Search via text
	.put(app.auth, function(req, res){
		req.body.text = req.body.text.replace('*', '.*')

		models.LogEntry.find({
			barId: req.user.barId,
			message: { $regex: req.body.text, $options: 'i' }
		})
			.exec(function(err, logEntries){
				if(err){
					res.send(err, 500)
				} else {
					
					var logThreadIds = []

					logEntries.forEach(function(logEntry){
						if(logThreadIds.indexOf(logEntry.logThread.toString()) == -1){
							logThreadIds.push(logEntry.logThread.toString())
						}
					})

					models.LogThread.find({
						_id: { $in: logThreadIds }
					})
						.populate('entries')
						.exec(function(err, logThreads){
							if(err){
								res.send(err, 500)
							} else {
								models.LogThread.generateLogBook(logThreads, function(err, logbook){
									if(err){
										res.send(err, 500)
									} else {
										res.send(logbook)
									}
								})
							}
						})

					// logEntries.forEach(function(logEntry){
					// 	if(!logThreads[logEntry.logThread._id]){
					// 		logThreads[logEntry.logThread._id] = logEntry.logThread
					// 		logThreads[logEntry.logThread._id].entries = []
					// 	}
					// 	logEntry.logThread = logEntry.logThread._id
					// 	console.log(logEntry)
					// 	console.log(logThreads[logEntry.logThread].entries)
					// 	logThreads[logEntry.logThread].entries.push(logEntry)
					// 	console.log(logThreads[logEntry.logThread].entries)
					// })

					// var results = []
					// Object.keys(logThreads).forEach(function(logThreadId){
					// 	results.push(logThreads[logThreadId])
					// })

					// models.LogThread.generateLogBook(results, function(err, logbook){
					// 	if(err){
					// 		res.send(err, 500)
					// 	} else {
					// 		res.send(logbook)
					// 	}
					// })
				}

			})

		// var searchResults = []
		// async.waterfall([

		// 	function(done){
		// 		models.LogThread.textSearch(req.body.text, {
		// 			filter: {
		// 				barId: req.user.barId
		// 			}
		// 		}, function(err, output){
		// 				if(err){
		// 					done(err)
		// 				} else {
		// 					var logThreadIds = []
		// 					output.results.forEach(function(result){
		// 						logThreadIds.push(result.obj._id)
		// 					})

		// 					models.LogThread.find({
		// 						_id: { $in: logThreadIds }
		// 					})
		// 						.populate('entries')
		// 						.exec(function(err, logThreads){
		// 							if(err){
		// 								done(err)
		// 							} else {
		// 								models.LogThread.generateLogBook(logThreads, function(err, logbook){
		// 									done(err, logThreadIds, logbook)
		// 								})
		// 							}
		// 						})
		// 				}
		// 			})
		// 	},

		// 	function(logThreadIds, logbook, done){
		// 		models.LogEntry.textSearch(req.body.text, {
		// 			filter: {
		// 				barId: req.user.barId,
		// 				thread: { $nin: logThreadIds }
		// 			}
		// 		}, function(err, output){
		// 				if(err || !output || output.length == 0){
		// 					done(err)
		// 				} else {

		// 					var foundThreadIds = []
		// 					output.results.forEach(function(result){
		// 						if(result.obj.logThread){
		// 							var found
		// 							foundThreadIds.forEach(function(id){
		// 								if(result.obj.logThread.toString() ==
		// 									id.toString()){
		// 									found = true
		// 								}
		// 							})

		// 							if(!found){
		// 								foundThreadIds.push(result.obj.logThread)
		// 							}
		// 						}
		// 					})

		// 					models.LogThread.find({
		// 						_id: { $in: foundThreadIds }
		// 					})
		// 						.populate('entries')
		// 						.exec(function(err, logThreads){
		// 							if(err){
		// 								done(err)
		// 							} else {
		// 								models.LogThread.generateLogBook(logThreads, function(err, moreLogbook){
		// 									if(err){
		// 										done(err)
		// 									} else {
		// 										logbook = logbook.concat(moreLogbook)
		// 										done(null, logbook)
		// 									}
		// 								})
		// 							}
		// 						})
		// 				}

		// 			})
		// 	},

		// ], function(err, logThreads){
		// 	if(err){
		// 		res.send(err, 500)
		// 	} else {
		// 		var logbook = []
		// 		logThreads.forEach(function(logThread){
		// 			var found
		// 			logbook.forEach(function(logbookThread){
		// 				if(logbookThread._id.toString() ==
		// 					logThread._id.toString()){
		// 					found = true
		// 				}
		// 			})
		// 			if(!found){
		// 				logbook.push(logThread)
		// 			}
		// 		})

		// 		res.send(logbook)
		// 	}
		// })
	})

	logbook.route('/:logThreadId')
		//Get the logThread and it's replies
		.get(app.auth, function(req, res){
			//Check to see if the user can view the logbook
			if(!req.user.hasPermission('logbooks.read')){
				res.send('You do not have permission to read the logbooks', 403)
				return
			}

			models.LogThread.findOne({
				barId: req.user.barId,
				_id: req.params.logThreadId
			})
			.populate('entries')
			.exec(function(err, logThread){
				if(err){
					res.send(err, 500)
				} else if(!logThread){
					res.send('No such log thread found', 404)
				} else {

					var users = {}

					logThread.entries.forEach(function(entry){
						if(!users[entry.by]){
							users[entry.by] = 1
						}
					})

					async.each(Object.keys(users), function(_id, done){

						models.User.findOne({
							_id: _id
						}, function(err, user){
							if(!err && user){
								users[_id] = user.json()
							}
							done(null)
						})

					}, function(err){
						var thread = {
							_id: logThread._id,
							title: logThread.title,
							priority: logThread.priority,
							entries: [],

							updated: logThread.updated,
							created: logThread.created
						}

						logThread.entries.forEach(function(logEntry){
							thread.entries.push({
								_id: logEntry._id,
								by: users[logEntry.by],
								message: logEntry.message,
								imageKey: logEntry.imageKey,

								updated: logEntry.updated,
								created: logEntry.created
							})
						})

						res.send(thread)
					})

				}
			})
		})

		//Post a reply to that thread
		.post(app.auth, function(req, res){
			//Make sure the user has the ability to write
			//to the logbooks
			if(!req.user.hasPermission('logbooks.write')){
				res.send('You do not have permission to write to the logbooks', 403)
				return
			}

			models.LogThread.findOne({
				barId: req.user.barId,
				_id: req.params.logThreadId
			}, function(err, logThread){
				if(err){
					res.send(err, 500)
				} else if(!logThread){
					res.send('No such log thread found', 404)
				} else {

					async.waterfall([

						function(done){
							if(!req.files.image && !req.body.image){
								done(null, null)
							} else {
								uploadRoute(req, req.body.image, function(err, imageKey){
									done(err, imageKey)
								})
							}
						},

						function(imageKey, done){
							models.LogEntry.create({
								barId: req.user.barId,
								logThread: logThread._id,
								message: req.body.message,
								imageKey: imageKey,
								by: req.user._id
							}, function(err, logEntry){
								done(err, logEntry)
							})
						},

						function(logEntry, done){
							logThread.update({
								$push: {
									entries: logEntry._id
								}
							}, function(err){
								done(err, logEntry)
							})
						}

					], function(err, logEntry){
						if(err){
							res.send(err, 500)
						} else {
							res.send(logEntry)
						}
					})

				}
			})
		})




	return logbook

}
