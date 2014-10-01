module.exports = function(mongoose, models){

	var schema = mongoose.Schema({
		ownerId: {type: mongoose.Schema.Types.ObjectId, ref: 'User' },

		name: { type: String, index: true },
		streetAddress: String,
		city: String,
		zipcode: String,
		state: String,

		category: String,

		code: { type: String, index: true },
		roles: Object,

		//Promotions - stores all data for promotions
		//the bar has scheduled
		promotions: [mongoose.Schema.Types.ObjectId],

		suggestions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Suggestion' }],

		textsSent: { type: [{type: mongoose.Schema.Types.ObjectId, ref: 'SMS' }], default: [] },
		emailsSent: { type: [String], default: [] },

		facebookPageId: String,
		facebookAccessToken: String,
		facebookPageAccessToken: String,
		facebookAccessDate: Date,
		facebookTokenExpiration: Date,
		facebookAccessUser: {type: mongoose.Schema.Types.ObjectId, ref: 'User' },

		twitterRequestToken: String,
		twitterRequestTokenSecret: String,
		twitterAccessToken: String,
		twitterSecretToken: String,
		twitterAccessDate: Date,

		surveyAnswers: [{type: mongoose.Schema.Types.ObjectId, ref: 'BarSurveyAnswer' }],

		updated: { type: Date, default: Date.now },
		created: { type: Date, default: Date.now }
	})

	schema.statics.categoriesList = [
			'Bar/Pub/Tavern/Lounge',
			'Nightclub (Dance/Live)',
			'Restaurant (Casual/Other)',
			'Resort/Hotel/Motel',
			'Casino',
			'Supplier/Distributor',
			'Adult',
			'Media'
		]

	schema.statics.requiredAttributes = [
			'name',
			'streetAddress',
			'city',
			'zipcode',
			'state',
			'category'
		]

	schema.statics.defaultRoles = [
		{ position: 'Owner', permissions: 'admin' },
		{ position: 'Manager', permissions: 'manager' },
		{ position: 'Bartender', permissions: 'staff' },
		{ position: 'Waiter', permissions: 'staff' },
		{ position: 'Chef', permissions: 'staff' },
		{ position: 'Waitstaff', permissions: 'staff' }
	]

	schema.methods.json = function(){
		var self = this
		var json = {
			_id: self._id,
			ownerId: self.ownerId,
			name: self.name,
			streetAddress: self.streetAddress,
			city: self.city,
			zipcode: self.zipcode,
			state: self.state,
			category: self.category,
			code: self.code
		}

		if(self.facebookPageId && self.facebookPageAccessToken){
			json.facebook = true
		}

		if(self.twitterAccessToken && self.twitterSecretToken){
			json.twitter = true
		}

		return json
	}

	/*
		Generate a code for the bar, return the new bar object.
		cb - callback function(err, bar)
	*/
	schema.methods.generateCode = function(cb){
		var self = this

		var saveBar = function(bar, count, cb){
			if(typeof count == 'function'){
				cb = count
				count = 0
			}

			var code = ''
			for(var i = 0; i < 6; i++){
				code += Math.floor(Math.random() * 100) % 10
			}

			bar.code = code
			bar.save(function(err, bar){
				if(err && count < 10){
					saveBar(bar, count + 1, cb)
				} else if(err){
					cb(err)
				}else {
					cb(null, bar)
				}
			})
		}

		saveBar(self, cb)
	}

	/*
		Lock the bar and every user in it
	*/
	schema.methods.lockBar = function(cb){
		var self = this

		models.User.update({
			barId: self._id
		},{
			locked: true,
			token: sessionToken
		}, function(err){
			cb(err)
		})
	}

	
	return mongoose.model('Bar', schema)

}
