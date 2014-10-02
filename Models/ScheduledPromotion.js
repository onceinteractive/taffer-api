module.exports = function(mongoose, models){

	var schema = mongoose.Schema({

		barId: mongoose.Schema.Types.ObjectId,
		promotionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion', index: true },

		startDate: Date,
		endDate: Date,

		title: String,
		description: String,

		occurences: [Date],

		shareables: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shareable' }],

		updated: { type: Date, default: Date.now },
		created: { type: Date, default: Date.now }
	})

	return mongoose.model('ScheduledPromotions', schema)

}
