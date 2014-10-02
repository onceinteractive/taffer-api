var express = require('express')

module.exports = function(app, models){

	var questions = express.Router()

	questions.route('/')

		//Get all answered questions
		.get(app.auth, function(req, res){

			models.Question.find({
				answer: {
					$exists: true
				}
			})
				.populate('by')
				.exec(function(err, foundQuestions){
					if(err){
						res.send(err, 500)
					} else {
						var questions = []

						foundQuestions.forEach(function(question){
							questions.push({
								_id: question._id,
								by: {
									firstName: question.by.firstName,
									lastName: question.by.lastName,
									pictureURI: question.by.pictureURI
								},
								answer: question.answer,
								answertitle: question.answerTitle,
								question: question.question,
								created: question.created
							})
						})

						res.send(questions)
					}
				})
		})

		//Create new question
		/*
			Example post:
			{
				questionTitle: String,
				question: String
			}
		*/
		.post(app.auth, function(req, res){
			models.Question.create({
				by: req.user._id,

				questionTitle: req.body.questionTitle,
				question: req.body.question
			}, function(err, question){
				if(err){
					res.send(err, 500)
				} else {
					res.send(question)
				}
			})
		})

		//Search amongst answered questions
		/*
			{
				text: String - text field to search for
			}
		*/
		.put(app.auth, function(req, res){
			var foundQuestions = []
			models.Question.textSearch(req.body.text, {
				filter: {
					answer: {
						$exists: true
					}
				}
			},
				function(err, output){
				if(err){
					res.send(err, 500)
				} else {
					output.results.forEach(function(result){
						foundQuestions.push(result.obj)
					})
					res.send(foundQuestions)
				}
			})
		})

	questions.route('/mine')
		.get(app.auth, function(req, res){
			models.Question.find({
				by: req.user.id_id
			}, function(err, questons){
				if(err){
					res.send(err, 500)
				} else {
					res.send(questions)
				}
			})
		})

	questions.route('/:questionId')
		.get(app.auth, function(req, res) {
			models.Question.findOne(
				{ _id: req.params.questionId })
				.populate('by').
				exec(function(err, question) {
				if(err) {
					res.send(err, 500);
				} else {
					res.send(question);
				}
			});
		})


	return questions

}
