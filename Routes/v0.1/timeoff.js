
var express = require('express');
var async = require('async');
var uuid = require('node-uuid');
var util = require('util');

module.exports = function(app, models) {

    var timeOffRouter = express.Router();

    var pushNotification = require('../../Modules/pushNotifications')(app, models)

    timeOffRouter.route('/')
        .all(app.auth)

        /*
            Acceptable query params:
                start: YYYY-MM-DD <- start date, optional
                end: YYYY-MM-DD <- end date, optional even if start is provided (will do until one week in future)

            If neither are provided, will do one week ahead, 5 weeks back
        */
        .get(function(req, res){
            if(req.user.hasPermission('schedule.approveTimeOff')){
                models.TimeOff.find({
                    bar: req.user.barId,
                    approvalStatus: null
                }, function(err, timeOffs){
                    if(err){
                        res.send(err)
                    } else {
                        res.send(timeOffs)
                    }
                })
            } else {
                models.TimeOff.find({
                    bar: req.user.barId,
                    requestor: req.user._id
                }, function(err, timeOffs){
                    if(err){
                        res.send(err, 500)
                    } else {
                        res.send(timeOffs)
                    }
                })
            }
        })

        /*
            Example post
            {
                requestReason: *optional*
                startTimeUTC: epoch time UTC
                endTimeUTC: epoch time UTC
            }
        */
        .post(function(req, res){
            if(!req.body.startTimeUTC ||
                !req.body.endTimeUTC){
                res.send(412)
                return
            }

            req.body.bar = req.user.barId
            req.body.requestor = req.user._id

            req.body.approvalManager = null
            req.body.approvalStatus = "pending"
            req.body.approvalDate = null

            models.TimeOff.create(req.body, function(err, timeOff){
                if(err){
                    res.send(err, 500)
                } else {
                    res.send(timeOff)

                    //Push notification
                    models.User.find({
                        barId: req.user.barId,
                        'permissions.schedule.approveTimeOff': true
                    }, function(err, users){
                        if(!err && users && users.length > 0){
                            var userIds = []
                            users.forEach(function(user){
                                userIds.push(user._id)
                            })

                            pushNotification(userIds,
                                req.user.firstName + ' ' + req.user.lastName + ' has made a time off request that requires review for approval.',
                                "Main.Schedule.ShiftSwap",
                                function(err){
                                    //Nothing to do
                                })
                        }
                    })
                }
            })
        })

    timeOffRouter.route('/upcoming')
        .get(app.auth, function(req, res){
            var startTime, endTime

            if(req.query.start){
                startTime = req.query.start
            } else {
                var startDate = new Date()
                startDate.setUTCHours(0,0,0,0)
                startDate.setDate(startDate.getDate() - (5 * 14) - startDate.getDay())
                startTime = startDate.getTime()
            }

            if(req.query.end){
                endTime = req.query.end
            } else {
                var endDate = new Date()
                endDate.setUTCHours(0,0,0,0)
                endDate.setDate(endDate.getDate() + 14 - endDate.getDay() )
                endTime = endDate.getTime()
            }

            models.TimeOff.find({
                bar: req.user.barId,
                startTimeUTC: { $lt: endTime },
                endTimeUTC: { $gte: startTime }
            })
                .populate('requestor')
                .populate('approvalManager')
                .exec(function(err, timeOffs){
                    if(err){
                        res.send(err)
                    } else {
                        var results = []

                        timeOffs.forEach(function(timeOff){
                            results.push(timeOff.json())
                        })

                        res.send(results)
                    }
                })
        })

    timeOffRouter.route('/:timeOffId/approve')
        /*
            Example PUT:
            {
                approve: true/false
                reason: message
            }
        */
        .put(app.auth, function(req, res){
            if(!req.user.hasPermission('schedule.approveTimeOff')){
                res.send(403)
                return
            }

            models.TimeOff.findOne({
                bar: req.user.barId,
                _id: models.ObjectId(req.params.timeOffId)
            }, function(err, timeOff){
                if(err){
                    res.send(err, 500)
                } else if(!timeOff){
                    res.send(404)
                } else {
                    timeOff.approvalManager = req.user.id
                    if(req.body.approve == true) timeOff.approvalStatus = "approved";
                    if(req.body.approve == false) timeOff.approvalStatus = "declined";
                    timeOff.approvalDate = new Date()
                    if(!req.body.approve){
                        declineReason = req.body.reason
                    }

                    timeOff.save(function(err){
                        if(err){
                            res.send(err, 500)
                        } else if(req.body.approve){
                            res.send(200)

                            pushNotification(timeOff.requestor,
                                req.user.firstName + ' ' + req.user.lastName + ' has approved your time off request.',
                                function(err){
                                    //Nothing to do
                                })

                        } else {
                            res.send(200)

                            pushNotification(timeOff.requestor,
                                req.user.firstName + ' ' + req.user.lastName + ' has declined your time off request.',
                                function(err){
                                    //Nothing to do
                                })
                        }
                    })
                }
            })
        })

    return timeOffRouter;
};
