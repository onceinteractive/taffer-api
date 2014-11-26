var express = require('express')
var async = require('async')

module.exports = function(app, models){

	var promotions = express.Router()
	var uploadRoute = require('../../Modules/imageUpload')(models)

	promotions.route('/')
		//Return all promotions for this user's bar
		//For now, this is just by category and not by area.
		//Area is a TBD feature.
		.get(app.auth, function(req, res){
			models.Bar.findOne({
				_id: req.user.barId
			}, function(err, bar){
				if(err){
					res.send(err, 500)
				} else {
					models.Promotion.find({
						$or: [
							{
								barCategories: bar.category,
								custom: false
							},
							{
								barId: bar._id,
								custom: true
							}
						]
					}, function(err, promotions){
						if(err){
							res.send(err, 500)
						} else {

							if(!promotions){
								promotions = []
							}

							res.send(promotions)

						}
					})

				}
			})
		})

		//Create a new promotion for the user
		/*
			Example post body:
			{
				promotion: {
					promotionId: String <~ OPTIONAL - id of the promotion template being used
					startDate: Date,
					endDate: Date,

					title: String,
					description: String,

					occurences: [Date] occursOn is an array of Dates of when this promotion happens.
				},


				shareables: [
					{
						selectedPicture: String - optional
						facebookMessage: String - optional
						twitterMessage: String - optional
						postOn: [
							{
								network: [String] => twitter, facebook,
								postTime: DateTime to post
							}
						]
					}
				]
			}
		*/
		.post(app.auth, function(req, res){
			//Check to see if this user has permissions
			if(!req.user.hasPermission('promotions.create')){
				res.send(403)
				return
			}

			if(!req.body.promotion){
				res.send('No promotion data attached', 500)
				return
			}

			async.waterfall([

				//If this links back to a promotional template, find it
				function(done){
					if(req.body.promotion.promotionId){
						models.Promotion.findOne({
							_id: models.ObjectId(req.body.promotion.promotionId)
						}, function(err, promotion){
							if(err){
								done(err)
							} else if(!promotion){
								done(null, null)
							} else {
								done(null, promotion._id)
							}
						})
					} else {
						done(null, null)
					}
				},

				//Create the promotion
				function(promotionId, done){
					models.ScheduledPromotion.create({
						barId: req.user.barId,
						promotionId: promotionId,

						startDate: req.body.promotion.startDate,
						endDate: req.body.promotion.endDate,

						title: req.body.promotion.title,
						description: req.body.promotion.description,

						occurences: req.body.promotion.occurences

					}, function(err, promotion){
						done(err, promotion)
					})
				},

				//Create the custom promotion if it's a custom.
				function(promotion, done){
					if(!req.body.promotion.promotionId){
						models.Promotion.create({
							title: promotion.title,
							description: promotion.description,
							custom: true,
							barId: req.user.barId
						}, function(err, customPromotion){
							if(err){
								done(err)
							} else {
								promotion.update({
									promotionId: customPromotion._id
								}, function(err){
									done(err, promotion)
								})
							}
						})
					} else {
						done(null, promotion)
					}
				},

				function(promotion, done){
					if(req.files.image || req.body.image){
						uploadRoute(req, req.body.image, function(err, imageKey){
							if(err){
								done(err)
							} else {
                                console.log("Promotion In Upload", promotion);
                                console.log("Image in Upload", imageKey);
                             	
                             	models.Promotion.update({
									_id: promotion._id
								}, {
									socialImages: imageKey
								}, function(err){
									if(err){
										done(err)
									} 
								})

                             	/*
                                promotion.update({
                                    $set: {
                                        socialImages: imageKey
                                    }
                                }, function(err){
                                    done(err)
                                })
                                */

								done(null, promotion, imageKey)
							}
						})
					} else {
						done(null, promotion, null)
					}
				},

				//With the promotion created, now create the shareables
				//For each shareable, schedule their tasks
				function(promotion, imageKey, done){
					var shareables = []

					if(!req.body.shareables || req.body.shareables.length == 0){
						done(null, promotion)
						return
					}
					
					async.each(req.body.shareables, function(newShareable, done){
						if(imageKey && newShareable.selectedImage == 'UPLOAD'){
							newShareable.selectedImage = imageKey
						}

						models.Shareable.create({
							barId: req.user.barId,
							scheduledPromotionId: promotion._id,

							facebookMessage: newShareable.facebookMessage,
							twitterMessage: newShareable.twitterMessage,

							selectedPicture: newShareable.selectedImage
						}, function(err, shareable){
							if(err){
								done(err)
								return;
							}
							shareables.push(shareable._id)

							//Now create the postOns
							async.each(newShareable.postOn, function(postOn, done){
								shareable.schedule(postOn.postTime, postOn.network,
									function(err, scheduledPost){
										done(err)
									})
							}, function(err){
								done(err)
							})

						})

					}, function(err){
						if(err){
							done(err)
						} else {
							promotion.update({
								$set: {
									shareables: shareables
								}
							}, function(err){
								done(err, promotion)
							})
						}
					})

				}

			], function(err, promotion){
				if(err){
					res.send(err, 500)
				} else {
					res.send(promotion)
				}
			})
		})

	promotions.route('/scheduled')
		//Get all scheduled promotions
		.get(app.auth, function(req, res){
			models.ScheduledPromotion.find({
				barId: req.user.barId
			})
				.populate('shareables')
				.exec(function(err, scheduledPromotions){
					if(err){
						res.send(err, 500)
					} else if(!scheduledPromotions){
						res.send([])
					} else {
						res.send(scheduledPromotions)
					}
				})
		})

	promotions.route('/scheduled/:scheduledPromotionId')
		.get(app.auth, function(req, res){
			models.ScheduledPromotion.findOne({
				barId: req.user.barId,
				_id: req.params.scheduledPromotionId
			})
				.populate('shareables')
				.exec(function(err, scheduledPromotion){
					if(err){
						res.send(err, 500)
					} else if(!scheduledPromotion){
						res.send(404)
					} else {
						res.send(scheduledPromotion)
					}
				})
		})

		//Update the promotion with new information/variables
		//NOT the shareables
		/*
			Example post body (all are optional):
			{
				title,
				description,
				occurences
			}
		*/
		.put(app.auth, function(req, res){
			if(!req.user.hasPermission('promotions.edit')){
				res.send(403)
				return
			}

			//First, we need to check the scheduled promotion to determine
			//if our update is the most recent
			models.ScheduledPromotion.findOne({
				_id: req.params.scheduledPromotionId,
				barId: req.user.barId
			}, function(err, scheduledPromotion){
				if(err){
					res.send(err, 500)
				} else if(!scheduledPromotion){
					res.send('No such scheduled promotion found', 404)
				} else {
					if(req.body.update < scheduledPromotion.updated){
						res.send(scheduledPromotion)
						return
					}

					scheduledPromotion.update(req.body, function(err){
						if(err){
							res.send(err, 500)
						} else {
							//Reload the ScheduledPromotion
							models.ScheduledPromotion.findOne({
								_id: scheduledPromotion._id
							}, function(err, scheduledPromotion){
								res.send(scheduledPromotion)
							})
						}
					})

				}
			})
		})

		//If we want to outright cancel a planned promotion for a user
		['delete'](app.auth, function(req, res){
			if(!req.user.hasPermission('promotions.delete')){
				res.send(403)
				return
			}

			models.ScheduledPromotion.findOne({
				barId: req.user.barId,
				_id: req.params.scheduledPromotionId
			}, function(err, scheduledPromotion){
				if(err){
					res.send(err, 500)
				} else if(!scheduledPromotion){
					res.send('No scheduled promotions found', 404)
				} else {

					async.parallel([

						function(done){
							//Delete all the shareables, and cancel their jobs
							models.Shareable.find({
								scheduledPromotionId: scheduledPromotion._id
							}, function(err, shareables){
								async.each(shareables, function(shareable, done){

									shareable.unscheduleAll(function(err, removed){
										done(err)
									})

								}, function(err){
									done(null)
								})
							})
						},

						function(done){
							//Remove from the bar listing
							models.Bar.update({
								_id: req.user.barId
							}, {
								$pull: { promotions: scheduledPromotion._id }
							}, function(err){
								done(null)
							})
						}
					], function() {

							models.Promotion.findOne({
								_id: scheduledPromotion.promotionId
							}, function(err, promotion){
								if(err){
									console.log('error found');
									res.send(err, 500)
								} else if(!promotion){
									console.log('Not found');
									res.send('No promotions found', 404)
								} else {
									console.log('removing');
									scheduledPromotion.remove()
									promotion.remove()
									res.send(200)

								}


								console.log('Promotion deleted end');
							})
						}

						,function(err){
						scheduledPromotion.remove()
						res.send(200)
					})
				}
			})


		})

	promotions.route('/:promotionId')

		//Returns the promotion. If the user has used it, returns with
		//a scheduled attribute
		/*
			Example return:
			{
				promotion: PROMOTIONDATA, <~ ALWAYS
				scheduledPromotion: SCHEDULEDPROMOTIONDATA <~ optional
			}
		*/
		.get(app.auth, function(req, res){
			var promotions = {}
			async.parallel([

				function(done){
					models.Promotion.findOne({
						_id: req.params.promotionId
					}, function(err, promotion){
						promotions['promotion'] = promotion
						done(err)
					})
				},

				function(done){
					models.ScheduledPromotion.findOne({
						barId: req.user.barId,
						promotionId: req.params.promotionId
					}, function(err, scheduledPromotion){
						promotions['scheduledPromotion'] = scheduledPromotion
						done(err)
					})
				}

			], function(err){
				if(err){
					res.send(err, 500)
				} else {
					res.send(promotions)
				}
			})
		})

	promotions.route('/scheduled/:scheduledPromotionId/:shareableId')
		//Get shareable
		.get(app.auth, function(req, res){
			models.Shareable.findOne({
				_id: req.params.shareableId,
				barId: req.user.barId,
				scheduledPromotionId: req.params.scheduledPromotionId
			}, function(err, shareable){
				if(err){
					res.send(err, 500)
				} else if(!shareable){
					res.send(404)
				} else {
					res.send(shareable)
				}
			})
		})

		//Update shareable
		/*
			Example posting:
			{
				facebookMessage: String,
				twitterMessage: String,
				selectedPicture: String,

				postOn: [{
					network: [String],
					postOn: DATE
				}] -> If this exists at all, it will destroy
									and reschedule the shareable.
			}
		*/
		.put(app.auth, function(req, res){
			if(!req.user.hasPermission('promotions.edit')){
				res.send(403)
				return
			}

			models.Shareable.findOne({
				_id: models.ObjectId(req.params.shareableId),
				barId: req.user.barId,
				scheduledPromotionId: req.params.scheduledPromotionId
			})
				.populate('postOn')
				.exec(function(err, shareable){
					if(err){
						res.send(err, 500)
					} else if(!shareable){
						res.send('Shareable not found', 404)
					} else {

						//If the shareable is more up to date, sync with the
						//newer one first
						if(shareable.updated < req.body.update){
							res.send(shareable)
							return
						}

						var postOn = []
						if(req.body.postOn){
							shareable.postOn.forEach(function(scheduledPost){
								models.Agenda.cancel({
									_id: scheduledPost.taskId
								}, function(err, numRemoved){
									//Do nothing
								})

								//Remove the scheduledPost
								scheduledPost.remove()
							})

							postOn = req.body.postOn
							delete req.body.postOn
						}

						shareable.update(req.body, function(err){
							if(err){
								res.send(err, 500)
							} else {
								models.Shareable.findOne({
									_id: shareable._id
								}, function(err, shareable){
									res.send(shareable)

									//Now schedule the tasks if different
									if(postOn){
										async.each(postOn, function(time, done){

											shareable.schedule(time.postOn, time.network, function(err, scheduledPost){
												done(err)
											})

										}, function(err){
											//Nothing to do
										})
									}
								})
							}
						})

					}
				})
		})


	return promotions

}
