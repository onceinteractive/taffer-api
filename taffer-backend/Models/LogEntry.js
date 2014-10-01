var textSearch = require('mongoose-text-search')

module.exports = function(mongoose, models){

	var schema = mongoose.Schema({
		by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
		barId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bar', index: true },
		logThread: { type: mongoose.Schema.Types.ObjectId, ref: 'LogThread', index: true },

		message: String,
		imageKey: String,

		updated: { type: Date, default: Date.now },
		created: { type: Date, default: Date.now }
	})

	//Introduce the text search
	schema.plugin(textSearch)

	schema.index({
		message: 'text'
	})

	return mongoose.model('LogEntry', schema)

}
