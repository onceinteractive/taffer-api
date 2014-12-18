var async = require('async')

module.exports = function(mongoose, models){

	var schema = mongoose.Schema({

		barId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bar' },
		scheduledPromotionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScheduledPromotion' },

		facebookMessage: String,
		twitterMessage: String,

		selectedPicture: String,

		postOn: [ { type: mongoose.Schema.Types.ObjectId, ref: 'ScheduledPost' } ],

		sharedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

		updated: { type: Date, default: Date.now },
		created: { type: Date, default: Date.now }
	})

	/*
		postOn - Date
		network - [String] -> twitter, facebook
		cb - callback function(err, taskId)
	*/
	schema.methods.schedule = function(postOn, network, cb){
		var self = this

		models.ScheduledPost.create({
			shareableId: self._id,
			network: network,
			postOn: postOn,
		}, function(err, scheduledPost){
			if(err){
				cb(err)
			} else {
				self.update({
					$push: {
						postOn: scheduledPost._id
					}
				}, function(err){
					if(err){
						cb(err)
					} else {
						models.Agenda.create('postPromotion_v0.1',
						{
							_id: scheduledPost._id
						})
							.schedule(postOn)
							.save(function(err, task){
								if(err){
									cb(err)
								} else {
									models.ScheduledPost.update({
										_id: scheduledPost._id
									}, {
										taskId: task.attrs._id
									}, function(err){
										cb(err, scheduledPost)
									})
								}
							})
					}
				})
			}
		})

		/*
		 shareableId - shareable object id
		 cb - callback function(err, postOn)
		 */

		schema.methods.schedulepost = function(shareableId, cb) {
			var self = this

			models.Shareable.findOne({
				_id: shareableId
			})
			.populate('postOn')
			.exec(function (err, postOns) {
				if (err) {
					cb(err)
				} else if (!postOns) {
					cb(null, [])
				} else {
					cb(null, postOn.postOn);
				}
			})
		}

		// models.Agenda.create('postPromotion', { _id: self._id })
		// 	.schedule(postOn)
		// 	.save(function(err, task){
		// 		if(err){
		// 			cb(err)
		// 		} else {
					// models.ScheduledPost.create({
					// 	shareableId: self._id,
					// 	network: network,
					// 	postOn: postOn,
					// 	taskId: task.attrs._id
					// }, function(err, scheduledPost){
					// 	if(err){
					// 		cb(err)
					// 	} else {
					// 		self.update({
					// 			$push: {
					// 				postOn: scheduledPost._id
					// 			}
					// 		}, function(err){
					// 			cb(err, scheduledPost)
					// 		})
					// 	}
					// })
		// 		}
		// })

	}

	schema.methods.unschedule = function(scheduledPostId, cb){
		var self = this

		models.ScheduledPost.findOne({
			_id: scheduledPostId,
		}, function(err, scheduledPost){
			if(err){
				cb(err)
			} else if(!scheduledPost){
				cb('No such scheduled post found')
			} else {
				models.Agenda.cancel({
					_id: scheduledPost.taskId
				}, function(err, numRemoved){
					self.update({
						$pull: scheduledPost._id
					}, function(err){
						scheduledPost.remove()
						cb(null)
					})
				})
			}
		})
	}

	schema.methods.unscheduleAll = function(cb){
		var self = this
		var removed = 0
		async.each(self.postOn, function(schedulePostId, done){
				self.unschedule(schedulePostId, function(err){
					removed++
					done(err)
				})
		}, function(err){
			cb(err, removed)
		})
	}

	return mongoose.model('Shareable', schema)

}
