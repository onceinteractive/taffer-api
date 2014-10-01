module.exports = function(mongoose, models){

	var schema = mongoose.Schema({
		barId: {type: mongoose.Schema.Types.ObjectId, ref: 'Bar' },
		sentBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User' },

		phoneNumber: String,

		message: String,

		SID: String,
		created: { type: Date, default: Date.now }
	})

	return mongoose.model('SMS', schema)

}
