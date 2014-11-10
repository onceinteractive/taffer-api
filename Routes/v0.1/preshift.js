var express = require('express')
var async = require('async')


module.exports = function(app, models){

    var preshift = express.Router()
    var uploadRoute = require('../../Modules/imageUpload')(models)
    var pushNotification = require('../../Modules/pushNotifications')(app, models);
    preshift.route('/')
        //Get all preshift messages for user
        .get(app.auth, function(req, res){
            if(req.user.hasPermission('preshift.view')){
                models.Preshift.find({
                    barId: req.user.barId,
                    to: req.user._id
                })
                    .populate('by')
                    .populate('to')
                    .exec(function(err, preshifts){
                        if(err){
                            res.send(err, 500)
                        } else {
                            var results = []

                            preshifts.forEach(function(preshift){
                                results.push(preshift.json())
                            })

                            res.send(results)
                        }
                    })
            } else {
                models.Preshift.find({
                    barId: req.user.barId,
                    $or: [
                            { by: req.user._id },
                            { to: req.user._id }
                        ]
                })
                    .populate('by')
                    .populate('to')
                    .exec(function(err, preshifts){
                        if(err){
                            res.send(err, 500)
                        } else {
                            var results = []

                            preshifts.forEach(function(preshift){
                                results.push(preshift.json())
                            })

                            res.send(results)

                        }
                    })
            }
        })

        //Post a new preshift
        /*
            Example Post:
            {
                to: [Strings] - multiple user ids
                title: Title text
                message: message,
            }
            FILES:
            image: the image that is being uploaded
        */
        .post(app.auth, function(req, res){
            if(!req.user.hasPermission('preshift.send')){
                res.send(403)
                return
            }

            async.waterfall([

                function(done){
                    if(!req.files.image && !req.body.image){
                        done(null, null)
                    } else {
                        uploadRoute(req, req.body.image, function(err, imageKey){
                            done(err, imageKey)
                        })
                    }
                },

                function(imageKey, done){
                    var recipients = [];
                    
                    async.each(req.body.to, function(to, done){
                        models.User.findOne({
                            _id: models.ObjectId(to),
                            barId: req.user.barId
                        }, function(err, user){
                            if(err){
                                done(err)
                            } else if(!user){
                                done(null)
                            } else {
                                recipients.push(user._id)
                                done(null)
                            }
                        })

                    }, function(err){
                        if(err){
                            done(err)
                        } else if(recipients.length == 0){
                            done({
                                    response: "Can't find any of the receiving users",
                                    status: 404
                                })
                        }
                        done(err, imageKey, recipients)
                    })
                },

                function(imageKey, recipients, done){

                    models.Preshift.create({
                        barId: req.user.barId,

                        by: req.user._id,
                        to: recipients,

                        title: req.body.title,
                        message: req.body.message,

                        image: imageKey
                    }, function(err, preshift){
                        done(err, preshift)
                    })

                },


            ], function(err, preshift){
                if(err){
                    if(typeof err == 'string'){
                        res.send(err, 500)
                    } else {
                        res.send(err.response, err.status)
                    }
                } else {
                    models.Preshift.findOne({
                        _id: preshift._id
                    })
                        .populate('to')
                        .populate('by')
                        .exec(function(err, preshift){
                            if(err){
                                res.send(err, 500)
                            } else if(!preshift){
                                res.send(500)
                            } else {
                                res.send(preshift.json())
                            }
                        })
                    var pushRecipients = []
                    preshift.to.forEach(function(participant){
                        if(participant.toString() != req.user._id){
                            pushRecipients.push(participant)
                        }
                    })
                    var pushMessage = req.user.firstName + ' ' + req.user.lastName + ' - ' + req.body.message.substring(0, 80)
                    if(req.body.message.length > 80){
                        pushMessage = pushMessage + '...'
                    }

                    pushNotification(pushRecipients,
                        pushMessage,
                        'Main.Preshift.List',
                        function(err){
                            //Nothing to do here regardless
                        }
                    )

                }
            })
        })


    return preshift

}
