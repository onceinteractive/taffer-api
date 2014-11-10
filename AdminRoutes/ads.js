var express = require('express')

module.exports = function(app, models){

    var ads = express.Router()
    var uploadRoute = require('../Modules/adminImageUpload')(models)

    ads.route('/')
        .get(app.adminAuth, function(req, res){
            if(!req.admin.hasPermission('ads.read')){
                res.send(403)
                return
            }

            models.Ad.find({
                _id: { $exists: true }
            }, function(err, ads){
                if(err){
                    res.send(err, 500)
                } else {
                    res.send(ads)
                }
            })
        })

        .post(app.adminAuth, function(req, res){
            if(!req.admin.hasPermission('ads.create')){
                res.send(403)
                return
            }

            uploadRoute(req, 'ads', function(err, keys){
                if(err){
                    res.send(err, 500)
                } else {
                    req.body.dashboardImage = keys;
                    // The array attached to FormData gets smashed to string according to the 
                    // FormData api, so we have to split it back to an array here.
                    req.body.states = req.body.states.split(',');
                    models.Ad.create(req.body, function(err, ad){
                        if(err){
                            res.send(err, 500)
                        } else {
                            res.send(ad)
                        }
                    })
                }
            })
        })

    ads.route('/:adId')
        .get(app.adminAuth, function(req, res) {
            if(!req.admin.hasPermission('ads.read')){
                res.send(403)
                return
            }
            models.Ad.findOne({
                _id: models.ObjectId(req.params.adId)
            }, function(err, ad){
                if(err){
                    res.send(err, 500)
                } else if(!ad){
                    res.send(404)
                } else {
                    res.send(ad);
                }
            })
        })

/*
        .put( app.adminAuth, function(req, res) {
            if(!req.admin.hasPermission('ads.create')){
                res.send(403)
                return
            }

            req.body.states = req.body.states.split(',')
            if( !req.files.image ) {
                model.ad.update({
                    _id: req.params.adId
                },
                req.body,
                function (err, ad) {

                })
            }
        })
*/
        .put(app.adminAuth, function(req, res){
            if(!req.admin.hasPermission('ads.create')){
                res.send(403)
                return
            }
            models.Ad.findOne({
                _id: req.params.adId
            }, function(err, ad){
                if(err){
                    res.send(err, 500)
                } else if(!ad){
                    res.send(404)
                } else {
                    // string --> array on smashed FormData array
                    req.body.states = req.body.states.split(',')
                    Object.keys(req.body).forEach(function(attr){
                        ad[attr] = req.body[attr]
                    })
                    ad.save(function(err){
                        if(err){
                            res.send(err)
                        } else {
                            if(!req.files.image){
                                res.send(ad)
                            } else {
                                uploadRoute(req, 'ads', function(err, keys){
                                    ad.dashboardImage = keys
                                    ad.save(function(err){
                                        if(err){
                                            res.send(err, 500)
                                        } else {
                                            res.send(ad)
                                        }
                                    })

                                    //Remove the old image
                                })
                            }

                            
                        }
                    })
                }
            })
        })

    return ads

}
