module.exports = function(mongoose, models){

	var schema = mongoose.Schema({
		tip: String,

		title: String,

		categories: { type: [String], index: true },
		barCategories: { type: [String], index: true }
	})

	schema.statics.categories = ['Human Resources', 'Marketing', 'Promotions']

	return mongoose.model('Tip', schema)

}
