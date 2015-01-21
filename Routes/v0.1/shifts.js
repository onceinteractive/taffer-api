/**
 * Re-created by kchester on 7/8/14.
 */
var express = require('express');
var async = require('async');
var uuid = require('node-uuid');

module.exports = function(app, models) {

    var shiftRouter = express.Router()
    var pushNotification = require('../../Modules/pushNotifications')(app, models);

    shiftRouter.route('/')
        .all(app.auth)

        /*
            Acceptable query params:
                start: YYYY-MM-DD <- start date, optional
                end: YYYY-MM-DD <- end date, optional even if start is provided (will do until one week in future)

            If neither are provided, will do one week ahead, 5 weeks back
        */
        .get(function(req, res){
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

            var query = {
                bar: req.user.barId,
                startTimeUTC: { $lt: endTime },
                endTimeUTC: { $gte: startTime }
            }

            if(!req.user.hasPermission('schedule.scheduleUsers')){
                query.published = true
            }

            models.Shift.find(query)
                .populate('user')
                .populate('scheduler')
                .exec(function(err, shifts){
                    if(err){
                        res.send(err, 500)
                    } else {
                        var results = []

                        shifts.forEach(function(shift){
                            results.push(shift.json())
                        })

                        res.send(results)
                    }
                })
        })

        .post(function(req, res){
            if(!req.user.hasPermission('schedule.scheduleUsers')){
                res.send(403)
                return
            }

            req.body.user = models.ObjectId(req.body.user)

            models.User.findOne({
                _id: req.body.user,
                barId: req.user.barId
            }, function(err, user){
                if(err){
                    res.send(err, 500)
                } if(!user){
                    res.send(404)
                } else {
                    req.body.bar = req.user.barId
                    req.body.scheduler = req.user._id

                    models.Shift.create(req.body, function(err, shift){
                        if(err){
                            res.send(err, 500)
                        } else {

                            models.Shift.find({
                                bar: req.user.barId,
                                startTimeUTC: { $lt: req.body.weekEnd },
                                endTimeUTC: { $gte: req.body.weekStart },
                                published: true
                            }, function(err, shifts){
                                if(err){
                                    res.send(err, 500)
                                } else if(!shifts || shifts.length == 0){

                                    res.send(shift.json())
                                } else {

                                    models.Shift.update({
                                        _id: shift._id
                                    }, {
                                        published: true
                                    }, function(err){
                                        if(err){
                                            res.send(err, 500)
                                        } else {
                                            console.log("Sender: "+ shift.user.toString()+ "Receiver: "+req.user._id)
                                            if(shift.user.toString()!=req.user._id){
                                                console.log("Sending notification to "+ shift.user.toString());
                                                pushNotification(shift.user,
                                                    req.user.firstName + ' ' + req.user.lastName + ' has scheduled shift for you.',
                                                    "Main.Schedule.Overview",
                                                    function(err){
                                                        //Nothing to do
                                                        console.log("error in notification");
                                                    })
                                            }
                                            var shiftJSON = shift.json()
                                            shiftJSON.published = true
                                            res.send(shiftJSON)
                                        }
                                    })


                                }
                            })
                        }
                    })
                }
            })
        })

    shiftRouter.route('/publish')
        .post(app.auth, function(req,res){
            console.log('start publishing');
            if(!req.user.hasPermission('schedule.scheduleUsers')){
                res.send(403)
                return
            }

            models.Shift.update({
                bar: req.user.barId,
                startTimeUTC: { $lt: req.body.weekEnd },
                endTimeUTC: { $gte: req.body.weekStart }
            }, {
                published: true
            }, {
                multi: true
            }, function(err){
                if(err){
                    res.send(err, 500)
                } else {
                    res.send(200)
                }
            })

            // send notifications to all users who have shifts
            console.log('start');
            models.Shift.find({
                bar: req.user.barId,
                startTimeUTC: { $lt: req.body.weekEnd },
                endTimeUTC: { $gte: req.body.weekStart },
                published: true
            }, function(err, shifts){
                if(err){
                    res.send(err, 500)
                } else {
                    shifts.forEach(function(shift){
                        console.log("Sender: "+ shift.user.toString()+ "Receiver: "+req.user._id)
                       if(shift.user.toString()!=req.user._id){
                            console.log("Sending notification to "+ shift.user.toString());
                           pushNotification(shift.user,
                               req.user.firstName + ' ' + req.user.lastName + ' has published a schedule for you.',
                               "Main.Schedule.Overview",
                               function(err){
                                   //Nothing to do
                                   console.log("error in notification");
                               })
                       }
                    })

                }
            })

            ///end


        })

    shiftRouter.route('/nextShift')
      .all(app.auth)
      .get(function(req, res) {
        models.Shift.find({
          bar: req.user.barId,
          user: req.user._id,
          startTimeUTC: {
            $gt: new Date().getTime()
          }
        })
        .sort('startTimeUTC')
        .limit(4)
        .exec(function(err, shifts) {
            if(err){
                res.send(err, 500)
            } else if(!shifts || shifts.length == 0){
                res.send([])
            } else{
                var results = []

                shifts.forEach(function(shift){
                    results.push(shift.json())
                })

                res.send(results)
            }
        })
      })

    shiftRouter.route('/user/:userId/upcoming')
        .all(app.auth)
        .get(function(req, res){
            models.Shift.find({
                bar: req.user.barId,
                user: models.ObjectId(req.params.userId),
                startTimeUTC: { $gt: (new Date()).getTime() }
            })
            .populate('user')
            .populate('scheduler')
            .exec(function(err, shifts){
                if(err){
                    res.send(err, 500)
                } else if(!shifts || shifts.length == 0){
                    res.send([])
                } else {
                    var results = []

                    shifts.forEach(function(shift){
                        results.push(shift.json())
                    })

                    res.send(results)
                }
            })
        })

    shiftRouter.route('/:shiftId')
        .get(app.auth, function(req, res){
            models.Shift.findOne({
                bar: req.user.barId,
                _id: models.ObjectId(req.params.shiftId)
            })
                .populate('user')
                .populate('scheduler')
                .exec(function(err, shift){
                    if(err){
                        res.send(err, 500)
                    } else if(!shift){
                        res.send(404)
                    } else {
                        res.send(shift.json())
                    }
                })
        })

        .put(app.auth, function(req, res){
            req.body.updated = new Date()
            req.body.scheduler = req.user._id
            req.body.bar = req.user.barId

            models.Shift.findOne({
                bar: req.user.barId,
                _id: models.ObjectId(req.params.shiftId)
            }, function(err, shift){
                if(err){
                    res.send(err, 500)
                } else {
                    shift.startTimeUTC = req.body.startTimeUTC;
                    shift.endTimeUTC = req.body.endTimeUTC;
                    shift.scheduler = req.body.scheduler;
                    shift.isOpening = req.body.isOpening;
                    shift.isClosing = req.body.isClosing;
                    shift.updated = req.body.updated;

                    shift.save(function(err) {
                        if(err) {
                            res.send(err, 500);
                        } else {

                            console.log("Sender: "+ shift.user.toString()+ "Receiver: "+req.user._id)
                            if(shift.user.toString()!=req.user._id && (shift.published)){
                                console.log("Sending notification to "+ shift.user.toString());
                                pushNotification(shift.user,
                                    req.user.firstName + ' ' + req.user.lastName + ' has updated a scheduled shift of you.',
                                    "Main.Schedule.Overview",
                                    function(err){
                                        //Nothing to do
                                        console.log("error in notification");
                                    })
                            }
                            res.send(200);
                        }
                    });
                }
            })
        })

        .delete(app.auth, function(req, res){
            if(!req.user.hasPermission('schedule.scheduleUsers')){
                res.send(403)
                return
            }

            models.Shift.remove({
                _id: req.params.shiftId,
                bar: req.user.barId
            }, function(err){
                if(err){
                    res.end(err, 500)
                } else {

                    res.send(200)
                }
            })
        })

    return shiftRouter;
};
