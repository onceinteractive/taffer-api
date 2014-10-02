module.exports = function(mongoose, models) {

	var schema = mongoose.Schema({
		message: String,
		sendDate: {type: Date, default: Date.now},
		shouldShow: {type: Boolean, default: true},
		status: {type: String, default: 'unread'},
		pageUrl: String
	});

	return mongoose.model('Notification', schema);
}
