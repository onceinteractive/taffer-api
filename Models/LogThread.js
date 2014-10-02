var textSearch = require('mongoose-text-search')
var async = require('async')

module.exports = function(mongoose, models){

	var schema = mongoose.Schema({
		barId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bar', index: true },

		title: String,
		priority: {type: Boolean, default: false},
		entries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LogEntry', index: true }],

		updated: { type: Date, default: Date.now },
		created: { type: Date, default: Date.now }
	})

	//Introduce the text search
	schema.plugin(textSearch)

	schema.index({
		title: 'text'
	})

	schema.statics.generateLogBook = function(logThreads, cb){
		logThreads.sort(function(a, b){
			if(a.created > b.created){
				return 1
			} else if(a.created < b.created){
				return -1
			} else {
				return 0
			}
		})

		var users = {}
		logThreads.forEach(function(logThread){
			logThread.entries.forEach(function(logEntry){
				if(!users[logEntry.by]){
					users[logEntry.by] = 1
				}
			})
		})

		async.each(Object.keys(users), function(_id, done){

			models.User.findOne({ _id: models.ObjectId(_id) }, function(err, user){
				if(!err && user){
					users[_id] = user.json()
				}
				done(null)
			})

		}, function(err){
			if(err){
				cb(err)
				return
			}

			var threads = []
			logThreads.forEach(function(logThread){
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

				threads.push(thread)
			})

			cb(null, threads)

		})

	}

	return mongoose.model('LogThread', schema)

}
