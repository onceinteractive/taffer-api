var express = require('express')
var async = require('async')

module.exports = function(app, models){

    var questions = express.Router()

    questions.route('/')

        .get(app.adminAuth, function(req, res){
            if(!req.admin.hasPermission('questions.read')){
                res.send(403)
                return
            }

            models.Question.find({
                _id: { $exists: true }
            })
                .populate('by')
                .exec(function(err, questions){
                    if(err){
                        res.send(err, 500)
                    } else {
                        var answered = [],
                            open = []

                        questions.forEach(function(question){
                            if(question.answer){
                                answered.push(question.json())
                            } else {
                                open.push(question.json())
                            }
                        })

                        res.send({
                            answered: answered,
                            open: open
                        })
                    }
                })
        })

    questions.route('/:questionId')

        .put(app.adminAuth, function(req, res){
            if(!req.admin.hasPermission('questions.edit')){
                res.send(403)
                return
            }

            models.Question.findOne({
                _id: models.ObjectId(req.params.questionId)
            }, function(err, question){
                if(err){
                    res.send(err, 500)
                } else if(!question){
                    res.send(404)
                } else {
                    Object.keys(req.body).forEach(function(attr){
                        question[attr] = req.body[attr]
                    })

                    question.save(function(err){
                        if(err){
                            res.send(500)
                        } else {
                            res.send(question.json())
                        }
                    })
                }
            })

        })

        .delete(app.adminAuth, function(req, res){
            if(!req.admin.hasPermission('questions.edit')){
                res.send(403)
                return
            }

            models.Question.findOne({
                _id: models.ObjectId(req.params.questionId)
            }, function(err, question){
                if(err){
                    res.send(err, 500)
                } else if(!question){
                    res.send(404)
                } else {
                    question.remove(function(err){
                        if(err){
                            res.send(err, 500)
                        } else {
                            res.send(200)
                        }
                    })
                }
            })

        })


    return questions

}
