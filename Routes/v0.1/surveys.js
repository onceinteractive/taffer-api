var express = require('express')
var async = require('async')

module.exports = function(app, models){

	var surveys = express.Router()

	surveys.route('/')

		//Get all survey questions
		.get(app.auth, function(req, res){
			models.BarSurveyQuestion.find({
				active: true
			}, function(err, surveyQuestions){
				if(err){
					res.send(err, 500)
				} else if(!surveyQuestions || surveyQuestions.length == 0){
					res.send([])
				} else {
					models.Bar.findOne({
						_id: req.user.barId
					})
						.populate('surveyAnswers')
						.exec(function(err, bar){
							if(err){
								res.send(err, 500)
							} else if(!bar){
								res.send('No bar found', 500)
							} else {
								if(!bar.surveyAnswers){
									bar.surveyQuestions = []
								}

								var questions = []
								surveyQuestions.forEach(function(question){
									var obj = {
										_id: question._id.toString(),
										order: question.order,
										question: question.question,
										instructions: question.instructions,
										otherReplacement: question.otherReplacement,
										type: question.type,
										choices: question.choices,
										answers: {}
									}

									questions.push(obj)
								})

								bar.surveyAnswers.forEach(function(answer){
									questions.forEach(function(question){
										if(question._id == answer.question.toString()){
											question.answers = answer.answers
										}
									})
								})

								res.send(questions)

							}
						})
				}
			})

			// res.send(models.Bar.surveyQuestions)

			// models.BarSurveyQuestion.find({
			// 	active: true
			// }, function(err, questions){
			// 	if(err){
			// 		res.send(err, 500)
			// 	} else {
			// 		res.send(questions)
			// 	}
			// })
		})

		/*
			Example Post:
			[
				{
					question: string, <~ id
					answers: MIXED
				}
			]
		*/
		.post(app.auth, function(req, res){
			if(!req.user.hasPermission('bars.edit')){
				res.send(403)
				return
			}
			
			if(!(req.body instanceof Array)){
				res.send(412)
				return
			}

			var answerIds = []
			async.each(req.body, function(answer, done){

				var id = models.ObjectId(answer.question)
				if(id){
					models.BarSurveyAnswer.create({
						question: id,
						answers: answer.answers,
						bar: req.user.barId
					}, function(err, barSurveyAnswer){
						if(err){
							done(err)
						} else {
							answerIds.push(barSurveyAnswer._id)
							done(null)
						}
					})
				} else {
					//Don't save - it's a bad answer for some reason
					done(null)
				}

			}, function(err){
				if(err){
					res.send(err, 500)
				} else {
					models.Bar.update({
						_id: req.user.barId
					}, {
						surveyAnswers: answerIds
					}, function(err, num){
						if(err){
							res.send(err, 500)
						} else {
							res.send(200)
						}
					})
				}
			})
		})


	return surveys

}
