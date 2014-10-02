module.exports = function(mongoose, models){

	var schema = mongoose.Schema({
		question: String,
		instructions: String,
		otherReplacement: String,
		type: String,

		order: Number,

		choices: mongoose.Schema.Types.Mixed, 

		active: { type: Boolean, index: true },

		updated: { type: Date, default: Date.now },
		created: { type: Date, default: Date.now }
	})

	return mongoose.model('BarSurveyQuestion', schema)

}
