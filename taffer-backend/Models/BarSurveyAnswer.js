module.exports = function(mongoose, models){

	var schema = mongoose.Schema({
		question: String,
		bar: {type: mongoose.Schema.Types.ObjectId, ref: 'User' },

		answers: mongoose.Schema.Types.Mixed,

		updated: { type: Date, default: Date.now },
		created: { type: Date, default: Date.now }
	})

	return mongoose.model('BarSurveyAnswer', schema)

}
