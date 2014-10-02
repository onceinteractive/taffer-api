module.exports = function(mongoose, models){

	var schema = mongoose.Schema({
		by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

		message: String,

		hidden: { type: Boolean, default: false },

		updated: { type: Date, default: Date.now },
		created: { type: Date, default: Date.now }
	})

	return mongoose.model('Suggestion', schema)

}
