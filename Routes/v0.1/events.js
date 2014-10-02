var express = require('express');
var async = require('async');
var uuid = require('node-uuid');
var util = require('util');

module.exports = function(app, models) {

    var eventRouter = express.Router();
    // Handle changes from persistence sync library.
    eventRouter.route('/')
        .all(app.auth)
        .get(function(req, res){
            var startTime, endTime

            if(req.query.start){
                startTime = req.query.start
            } else {
                var startDate = new Date()
                startDate.setUTCHours(0,0,0,0)
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

            models.Event.find({
                bar: req.user.barId,
                startTimeUTC: { $lt: endTime },
                endTimeUTC: { $gte: startTime }
            }, function(err, events){
                if(err){
                    res.send(err, 500)
                } else {
                    var results = []

                    events.forEach(function(event){
                        results.push(event.json())
                    })

                    res.send(results)
                }
            })
        })

        .post(function(req, res){
            if(!req.user.hasPermission('schedule.scheduleEvents')){
                res.send(403)
                return
            }

            req.body.bar = req.user.barId
            req.body.scheduler = req.user._id

            models.Event.create(req.body, function(err, event){
                if(err){
                    res.send(err, 500)
                } else {
                    res.send(event.json())
                }
            })
        })

    eventRouter.route('/series')
        .all(app.auth)
        /*
            Example Body:
            [
                EVENT
            ]
        */
        .post(function(req, res){
            if(!req.user.hasPermission('schedule.scheduleEvents')){
                res.send(403)
                return
            }

            var identifier = uuid.v4()

            async.each(req.body, function(bodyEvent, done){

                bodyEvent.bar = req.user.barId
                bodyEvent.scheduler = req.user._id
                bodyEvent.extendsSeries = identifier

                models.Event.create(bodyEvent, function(err, event){
                    done(err)
                })

            }, function(err){
                if(err){
                    console.log(err);
                    res.send(err, 500)
                } else {
                    res.send(200)
                }
            })
        })

    eventRouter.route('/series/:uuid')
        .all(app.auth)
        .get(function(req, res){
            models.Event.find({
                bar: req.user.barId,
                extendsSeries: req.params.uuid
            }, function(err, events){
                if(err){
                    res.send(err, 500)
                } else if(!events || events.length == 0){
                    res.send(404)
                } else {
                    var json = []

                    events.forEach(function(event){
                        json.push(event.json())
                    })
                }
            })

        })
        .put(function(req, res){
            if(!req.user.hasPermission('schedule.scheduleEvents')){
                res.send(403)
                return
            }

            delete req.body.bar
            delete req.body.createdAt
            delete req.body.updatedAt
            delete req.body.scheduler
            delete req.body.startTimeUTC
            delete req.body.endTimeUTC
            req.body.updatedAt = new Date()
            
            models.Event.update({
                bar: req.user.barId,
                extendsSeries: req.params.uuid
            }, req.body, { multi: true }, function(err){
                if(err){
                    res.send(err, 500)
                } else {
                    res.send(200)
                }
            })
        })

        .delete(function(req, res){
            if(!req.user.hasPermission('schedule.scheduleEvents')){
                res.send(403)
                return
            }

            models.Event.remove({
                bar: req.user.barId,
                extendsSeries: req.params.uuid
            }, function(err){
                if(err){
                    res.send(err, 500)
                } else {
                    res.send(200)
                }
            })
        })


    eventRouter.route('/:eventId')
        .all(app.auth)
        .get(function(req, res){
            models.Event.findOne({
                _id: req.params.eventId,
                bar: req.user.barId
            }, function(err, foundEvent){
                if(err){
                    res.send(err, 500)
                } else if(!foundEvent){
                    res.send(404)
                } else {
                    res.send(foundEvent)
                }
            })
        })

        .put(function(req, res){
            if(!req.user.hasPermission('schedule.scheduleEvents')){
                res.send(403)
                return
            }

            req.body.bar = req.user.barId
            req.body.update = new Date()

            models.Event.update({
                _id: req.params.eventId,
                bar: req.user.barId
            }, req.body, function(err){
                if(err){
                    res.send(err, 500)
                } else {
                    res.send(200)
                }
            })
        })

        .delete(function(req, res){
            if(!req.user.hasPermission('schedule.scheduleEvents')){
                res.send(403)
                return
            }

            models.Event.findOne({
                _id: models.ObjectId(req.params.eventId),
                bar: req.user.barId
            }, function(err, foundEvent){
                if(err){
                    res.send(err, 500)
                } else if(!foundEvent){
                    res.send(404)
                } else {
                    foundEvent.remove(function(err){
                        if(err){
                            res.send(err, 500)
                        } else {
                            res.send(200)
                        }
                    })
                }
            })
        })

    return eventRouter
};
