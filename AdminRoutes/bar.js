var express = require('express')
var async = require('async')
var uuid = require('node-uuid')

module.exports = function(app, models){

    var bars = express.Router()

    bars.route('/')

        //Search
        /*
            Directly search off of req.query
        */
        .get(app.adminAuth, function(req, res){

            Object.keys(req.query).forEach(function(query){
                req.query[query] = new RegExp('^'+ req.query[query] +'$', "i")
            })

            models.Bar.find(req.query, function(err, bars){
                if(err){
                    res.send(err, 500)
                } else {
                    var results = []
                    bars.forEach(function(bar){
                        results.push(bar.json())
                    })
                    res.send(results)
                }
            })
        })

        // .get(app.adminAuth, function(req, res){
        //     if(!req.admin.hasPermission('bars.read')){
        //         res.send(403)
        //         return
        //     }
        //
        //     var limit = 100
        //     var offset = 0
        //     if(req.query.limit){
        //         limit = req.query.limit
        //     }
        //     if(req.query.offset){
        //         offset = req.query.offset
        //     }
        //
        //     models.Bar.find({
        //         _id: {
        //             $exists: true
        //         }
        //     })
        //         .skip(offset)
        //         .limit(limit)
        //         .exec(function(err, foundBars){
        //             var bars = []
        //             foundBars.forEach(function(bar){
        //                 bars.push(bar.json)
        //             })
        //             res.send(bars)
        //         })
        //
        // })

    bars.route('/categoriesList')
        .get(app.adminAuth, function(req, res){
            res.send(models.Bar.categoriesList)
        })

    bars.route('/:barId')

        //Update the bar
        // .put(app.authAdmin, function(req, res){
        //     if(!req.admin.hasPermission('bars.edit')){
        //         res.send(403)
        //         return
        //     }
        //
        //     async.waterfall([
        //
        //         function(done){
        //             models.Bar.findOne({
        //                 _id: req.params.userId
        //             }, function(err, bar){
        //                 if(err || !bar){
        //                     res.send(404, 'Could not find requested bar')
        //                     done('no bar')
        //                 } else {
        //                     done(null, bar)
        //                 }
        //             })
        //         },
        //
        //         //Update each attribute of the bar as per req.body
        //         function(bar, done){
        //             Object.keys(req.body).forEach(function(update){
        //                 //Make sure that the update is actually a schema field for users
        //                 if(models.Bar.editableFields.indexOf(update) != -1){
        //                     bar[update] = req.body[update]
        //                 }
        //             })
        //
        //             if(!req.body.updated){
        //                 bar.updated = new Date()
        //             }
        //
        //             done(null, bar)
        //         },
        //
        //         function(bar, done){
        //             bar.save(function(err){
        //                 if(err){
        //                     res.send(500, err)
        //                 } else {
        //                     done(null, bar)
        //                 }
        //             })
        //         }
        //
        //     ], function(err, bar){
        //         if(!err){
        //             res.send(bar)
        //         }
        //     })
        // })

        //Get Bar if allowed
        .get(app.adminAuth, function(req, res){
            if(!req.admin.hasPermission('bars.read')){
                res.send(403)
                return
            }

            models.Bar.findOne({
                _id: req.params.barId
            }, function(err, bar){
                if(err || !bar){
                    res.send(404)
                } else {
                    res.send(bar)
                }
            })
        })

    bars.route('/:barId/users')
        .get(app.adminAuth, function(req, res){
            if(!req.admin.hasPermission('bars.read')){
                res.send(403)
                return
            }

            models.User.find({
                barId: models.ObjectId(req.params.barId)
            }, function(err, users){
                var results = []

                users.forEach(function(user){
                    results.push(user.json())
                })

                res.send(results)
            })

        })

    bars.route('/:barId/lock')
        .delete(app.adminAuth, function(req, res){
            if(!req.admin.hasPermission('bars.edit')){
                res.send(403)
                return
            }

            models.Bar.findOne({
                _id: req.params.barId
            }, function(err, bar){
                if(err){
                    res.send(err, 500)
                } else if(!bar){
                    res.send(404)
                } else {
                    bar.lockBar(function(err){
                        if(err){
                            res.send(err, 500)
                        } else {
                            res.send(200)
                        }
                    })
                }
            })
        })

    bars.route('/:barId/generateCode')
        .get(app.adminAuth, function(req, res){
            if(!req.admin.hasPermission('bars.edit')){
                res.send(403)
                return
            }

            models.Bar.findOne({
                _id: req.params.barId
            }, function(err, bar){
                if(err){
                    res.send(err, 500)
                } else if(!bar){
                    res.send(404)
                } else {
                    bar.generateCode(function(err, bar){
                        if(err){
                            res.send(err, 500)
                        } else {
                            res.send(bar)
                        }
                    })
                }
            })
        })

    


    return bars

}
