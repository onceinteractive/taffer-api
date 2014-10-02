module.exports = function(mongoose, model) {

	var schema = mongoose.Schema({
		deviceToken: {type: String, index: true},
		deviceType: String,
		deviceVersion: String,
		unregistered: {type: Boolean, default: false, index: true},

		user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},

		updated: { type: Date, default: Date.now },
		created: { type: Date, default: Date.now }
	});

	return mongoose.model('Device', schema);
}