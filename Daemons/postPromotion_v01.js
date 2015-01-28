var async = require('async')
var postToFacebook = require('../Modules/postToFacebook')()
var postToTwitter = require('../Modules/postToTwitter')()

if(!process.env.IMAGE_BUCKET){
	process.env.IMAGE_BUCKET = 'taffer-dev'
}

module.exports = function(models){

	var daemon = {
		name: 'postPromotion_v0.1',
		options: {}
	}

	daemon.job = function(job, done){
		//Load the scheduledPost
		models.ScheduledPost.findOne({
			_id: job.attrs.data._id
		})
			.populate('shareableId')
			.exec(function(err, scheduledPost){
				if(err){
					done(err)
				} else if(!scheduledPost){
					done('No scheduled post found')
				}else if(!( scheduledPost.shareableId
						&& scheduledPost.shareableId.barId
						&& scheduledPost.network) ){
					done(err)
				} else {
					models.Bar.findOne({
						_id: scheduledPost.shareableId.barId
					}, function(err, bar){
						if(err){
							done(err)
						} else if(!bar){
							models.ScheduledPost.update({
								_id: sheduledPost._id
							},{
								generalPost: 'Could not get social meda access tokens due to issue loading bar'
							}, function(err){
								done('No bar found - erroring out')
							})
						} else {
							if(scheduledPost.shareableId.selectedPicture.indexOf('https://') == -1
								&& scheduledPost.shareableId.selectedPicture.indexOf('http://') == -1){
								scheduledPost.shareableId.selectedPicture = 'https://s3.amazonaws.com/'
								+ process.env.IMAGE_BUCKET + '/' + scheduledPost.shareableId.selectedPicture
							}

							async.parallel([

								function(done){
									if(scheduledPost.network == 'facebook' || scheduledPost.network.indexOf('facebook') != -1){
										models.Shareable.find({
											_id: scheduledPost.shareableId
										})
											.populate('sharedBy')
											.exec(function(err, shareable) {
												if (err) {
													done(err)
												} else if (!shareable) {
													done("There is error in getting twitter post data")
												} else {
													var user = shareable[0].sharedBy.pop();
													postToFacebook(user,
														scheduledPost.shareableId.facebookMessage,
														scheduledPost.shareableId.selectedPicture,
														function(err, response){
															var update = {}
															if(err){
																update.facebookPostError = err
															} else {
																update.facebookPostId = response.id
															}

															models.ScheduledPost.update({
																_id: scheduledPost._id
															}, update, function(anotherErr){
																done(err)
															})
														})
												}
											})
									} else {
										done(null)
									}
								},

								function(done){
									if(scheduledPost.network == 'facebookPage' || scheduledPost.network.indexOf('facebookPage') != -1){
										postToFacebook(bar,
											scheduledPost.shareableId.facebookMessage,
											scheduledPost.shareableId.selectedPicture,
											function(err, response){
												var update = {}
												if(err){
													update.facebookPostError = err
												} else {
													update.facebookPostId = response.id
												}

												models.ScheduledPost.update({
													_id: scheduledPost._id
												}, update, function(anotherErr){
													done(err)
												})
											})
									} else {
										done(null)
									}
								},

								function(done){
									if(scheduledPost.network == 'twitter' || scheduledPost.network.indexOf('twitter') != -1){
										models.Shareable.find({
											_id: scheduledPost.shareableId
										})
										.populate('sharedBy')
										.exec(function(err, shareable){
											if(err){
												done(err)
											} else if(!shareable){
												done("There is error in getting twitter post data")
											} else {
												var user = shareable[0].sharedBy.pop();
												postToTwitter(user,
													scheduledPost.shareableId.twitterMessage,
													scheduledPost.shareableId.selectedPicture,
													function (err, data) {
														var update = {}
														if (err) {
															update.twitterPostError = err
														} else {
															update.twitterPostId = data.id
														}

														models.ScheduledPost.update({
															_id: scheduledPost._id
														}, update, function (anotherError) {
															done(err)
														})

													})
												}
											});
									} else {
										done(null)
									}
								}

							], function(err){
								done(err)
							})
							

						}
					})
				}
			})
	}


	return daemon

}