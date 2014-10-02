var express = require('express')
var async = require('async')
var uuid = require('node-uuid')

module.exports = function(app, models){

    var tips = express.Router()

    tips.route('/')
        .post(app.adminAuth, function(req, res){
            if(!req.admin.hasPermission('tips.create')){
                res.send(403)
                return
            }

            models.Tip.create({
                title: req.body.title,
                tip: req.body.tip,
                categories: req.body.categories,
                barCategories: req.body.barCategories
            }, function(err, tip){
                if(err){
                    res.send(err, 500)
                } else {
                    res.send(tip)
                }
            })
        })

        .get(app.adminAuth, function(req, res){

            if(!req.admin.hasPermission('tips.read')){
                res.send(403)
                return
            }

            var limit = 100
            var offset = 0
            if(req.query.limit){
                limit = req.query.limit
            }
            if(req.query.offset){
                offset = req.query.offset
            }

            models.Tip.find({
                _id: {
                    $exists: true
                }
            })
                .skip(offset)
                .limit(limit)
                .exec(function(err, tips){
                    res.send(tips)
                })
        })

    tips.route('/categories')
        .get(app.adminAuth, function(req, res){
            res.send(models.Tip.categories)
        })

    tips.route('/:tipId')

        //Get tip
        .get(app.adminAuth, function(req, res){
            if(!req.admin.hasPermission('tips.read')){
                res.send(403)
                return
            }

            models.Tip.findOne({
                _id: req.params.tipId
            }, function(err, tip){
                if(err){
                    res.send(err, 500)
                } else if(!tip){
                    res.send(404)
                } else {
                    res.send(tip)
                }
            })
        })

        //Update the tip
        /*
            Example Post:
            {
                title: String,
                tip: String,
                title: String,
                categories: [String],
                barCategories: [String]
            }
        */
        .put(app.adminAuth, function(req, res){
            if(!req.admin.hasPermission('tips.edit')){
                res.send(403)
                return
            }

            models.Tip.update({
                _id: req.params.tipId
            }, 
            req.body, 
            function(err, numUpdated){
                if(err){
                    res.send(err, 500)
                } else if(!numUpdated || numUpdated == 0){
                    res.send(404)
                } else {
                    models.Tip.findOne({
                        _id: req.params.tipId
                    }, function(err, tip){
                        if(err){
                            res.send(err, 500)
                        } else {
                            res.send(tip)
                        }
                    })
                }
            })
        })

    return tips

}
