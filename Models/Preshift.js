module.exports = function(mongoose, models){

	var schema = mongoose.Schema({
		barId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bar' },

		by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		to: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],

		title: String,
		message: String,

		image: String,

		updated: { type: Date, default: Date.now },
		created: { type: Date, default: Date.now } 

	})

	schema.methods.json = function(){
		var self = this

		var result = {
			by: self.by,
			to: self.to,

			title: self.title,
			message: self.message,

			image: self.image,

			updated: self.updated,
			created: self.created
		}

		if(self.by.json){
			result.by = self.by.json()
		}

		if(self.to && self.to.length > 0 && self.to[0].json){
			var to = []
			self.to.forEach(function(toUser){
				to.push(toUser.json())
			})
			result.to = to
		}

		return result
	}

	return mongoose.model('Preshift', schema)

}
