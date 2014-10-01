module.exports = function(mongoose, models){

	var schema = mongoose.Schema({
		threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },

		from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		sentOn: { type: Date, defaultValue: Date.now },
		message: String,
		imageKey: String
	})

	schema.methods.json = function(){
		var self = this

		var result = {
			_id: self._id,
			sentOn: self.sentOn,
			message: self.message,
			imageKey: self.imageKey
		}

		if(self.from && self.from.json){
			result.from = self.from.json()
		} else {
			result.from = self.from
		}

		return result
	}

	return mongoose.model('Message', schema)

}
