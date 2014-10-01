var textSearch = require('mongoose-text-search')

module.exports = function(mongoose, models){

	var schema = mongoose.Schema({
		by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

		questionTitle: String,
		question: String,

		publishedQuestionTitle: String,
		publishedQuestion: String,

		answerTitle: String,
		answer: String,

		updated: { type: Date, default: Date.now },
		created: { type: Date, default: Date.now }
	})

	//Introduce the text search
	schema.plugin(textSearch)

	schema.index({
		publishedQuestionTitle: 'text',
		publishedQuestion: 'text',
		answerTitle: 'text',
		answer: 'text'
	})

	schema.methods.json = function(){
		var self = this
		var result = {
			by: self.by,

			questionTitle: self.questionTitle,
			question: self.question,

			publishedQuestionTitle: self.publishedQuestionTitle,
			publishedQuestion: self.publishedQuestion,

			answerTitle: self.answerTitle,
			answer: self.answer,

			updated: self.updated,
			created: self.created
		}

		if(self.by.json){
			result.by = self.by.json()
		}

		return result
	}

	return mongoose.model('Question', schema)

}
