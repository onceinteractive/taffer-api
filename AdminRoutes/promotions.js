var express = require('express')
var async = require('async')

module.exports = function(app, models){

    var promotions = express.Router()
    var uploadRoute = require('../Modules/adminImageUpload')(models)

    promotions.route('/')
        .get(app.adminAuth, function(req, res){

            if(!req.admin.hasPermission('promotions.view')){
                res.send(403)
                return
            }

            models.Promotion.find({
                _id: { $exists: true }
            }, function(err, promotions){
                if(err){
                    res.send(err, 500)
                } else {
                    res.send(promotions)
                }
            })
        })

        .post(app.adminAuth, function(req, res){
            if(!req.admin.hasPermission('promotions.create')){
                res.send(403)
                return
            }
            req.body.areas = req.body.areas.split(',')
            req.body.categories = req.body.categories.split(',')

            uploadRoute(req, 'promotions', function(err, keys){
                req.body.socialImages = keys
                req.body.custom = false

                models.Promotion.create(req.body, function(err, promotion){
                    if(err){
                        res.send(err, 500)
                    } else {
                        res.send(promotion)
                    }
                })
            })
        })
        

    promotions.route('/:promotionId')
        .put(app.adminAuth, function(req, res){
            if(!req.admin.hasPermission('promotions.create')){
                res.send(403)
                return
            }

            async.waterfall([

                function(done){
                    if(req.files.images){
                        uploadRoute(req, 'promotions', function(err, keys){
                            done(err, keys)
                        })
                    } else {
                        done(null, null)
                    }
                },

                function(imageKeys, done){
                    if(imageKeys){
                        req.body.socialImages = imageKeys
                    } else {

                        // Break up stringified array (due to FormData attachment)
                        if (req.body.socialImages){
                            req.body.socialImages = req.body.socialImages.split(',')
                        }
                    }
                    // Break up stringified array (due to FormData attachment)
                    if (req.body.areas){
                        req.body.areas = req.body.areas.split(',')
                    }
                    // Break up stringified array (due to FormData attachment)
                    if (req.body.categories) {
                        req.body.categories = req.body.categories.split(',')
                    }

                    models.Promotion.update({
                        _id: models.ObjectId(req.params.promotionId)
                    }, req.body,
                    function(err){
                        if(err){
                            done(err)
                        } else {
                            models.Promotion.findOne({
                                _id: models.ObjectId(req.params.promotionId)
                            }, function(err, promotion){
                                done(err, promotion)
                            })
                        }
                    })
                }

            ], function(err, promotion){
                if(err){
                    res.send(err, 500)
                } else {
                    res.send(promotion)
                }
            })

            // models.Promotion.find({
            //     _id: req.params.promotionId
            // }, function(err, promotion){
            //     if(err){
            //         res.send(err, 500)
            //     } else if(!promotion){
            //         res.send(404)
            //     } else {
            //         Object.keys(req.body).forEach(function(attr){
            //             promotion[attr] = req.body[attr]
            //             promotion.save(function(err){
            //                 if(err){
            //                     res.send(err, 500)
            //                 } else if(!req.files.images){
            //                     res.send(promotion)
            //                 } else {
            //                     uploadRoute(req, 'promotions', function(err, keys){
            //                         promotion.socialImages = keys
            //                         promotion.save(function(err){
            //                             if(err){
            //                                 res.send(err, 500)
            //                             } else {
            //                                 res.send(promotion)
            //                             }
            //                         })
            //                         //Delete old images???
            //                     })
            //                 }
            //             })
            //         })
            //     }
            // })
        })

    return promotions

}
