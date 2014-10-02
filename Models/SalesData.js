module.exports = function(mongoose, models){

	var schema = mongoose.Schema({
		barId: {type: mongoose.Schema.Types.ObjectId, ref: 'Bar' },

		day: Date,

		salesAmount: Number,
		guestCount: Number,
		staffScheduled: Number,
		barOpenTime: String,
		barCloseTime: String,

		updated: { type: Date, default: Date.now },
		created: { type: Date, default: Date.now }
	})

	return mongoose.model('SalesData', schema)

}
