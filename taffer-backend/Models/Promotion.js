var async = require('async')
var uuid = require('node-uuid')

module.exports = function(mongoose, models){

	var schema = mongoose.Schema({
		areas: { type: [String], index: true },
		state: { type: [String], index: true },
		barCategories: { type: [String], index: true },
		categories: { type: [String], index: true },

		//Some promtions only really work during certain seasons
		startDate: { type: Date, index: true },
		endDate: { type: Date, index: true },

		socialImages: [String],

		title: String,
		description: String,

		barId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bar' },
		custom: { type: Boolean, defaultValue: true },
		sponsored: { type: Boolean, defaultValue: false }

	})

	return mongoose.model('Promotion', schema)

}
