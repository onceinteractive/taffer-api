/**
 Re-written by kchester 09/02/2014
 */

var express = require('express');
var async = require('async');
var uuid = require('node-uuid');
var util = require('util');

module.exports = function(app, models) {

    var swapRouter = express.Router();

    var pushNotification = require('../../Modules/pushNotifications')(app, models)

    swapRouter.route('/')
        .all(app.auth)
        .get(function(req, res){
            if(!req.user.hasPermission('schedule.approveSwap')){
                models.Swap.find({
                    $or: [
                        { requestor: req.user._id },
                        { switchWith: req.user._id }
                    ],
                    bar: req.user.barId
                })
                    .populate('requestor')
                    .populate('originalShift')
                    .populate('requestedShift')
                    .populate('switchWith')
                    .exec(function(err, shifts){
                        if(err){
                            res.send(err, 500)
                        } else {
                            res.send(shifts)
                        }
                    })
            } else {
                //Otherwise, just return all shift swap requests
                models.Swap.find({
                    bar: req.user.barId
                })
                    .populate('requestor')
                    .populate('originalShift')
                    .populate('requestedShift')
                    .populate('approvalManager')
                    .populate('switchWith')
                    .exec(function(err, shifts){
                        if(err){
                            res.send(err, 500)
                        } else {
                            res.send(shifts)
                        }
                    })
            }
        })

        /*
            Example POST:
            {
                switchWith: User ID that owns the shift
                requestedShift: shift id
                originalShift: my shift that I don't want
                requestReason: *optional* why you would like to swap
            }
        */
        .post(function(req, res){
            if(!req.body.switchWith ||
                !req.body.requestedShift ||
                !req.body.originalShift){
                res.send(412)
                return
            }

            models.Shift.findOne({
                bar: req.user.barId,
                _id: models.ObjectId(req.body.requestedShift),
                user: models.ObjectId(req.body.switchWith)
            }, function(err, shift){
                if(err){
                    res.send(err, 500)
                    return
                } else if(!shift){
                    res.send(404)
                    return
                }

                models.Shift.findOne({
                    bar: req.user.barId,
                    _id: models.ObjectId(req.body.originalShift),
                    user: req.user._id
                }, function(err, originalShift){
                    if(err){
                        res.send(err, 500)
                        return
                    } else if(!originalShift){
                        res.send(404)
                        return
                    }

                    //Prevent these from being assigned
                    req.body.requestor = req.user._id
                    req.body.bar = req.user.barId
                    req.body.approvalManager = null
                    req.body.approvalStatus = "pending"
                    req.body.approvalDate = null
                    req.body.switchWithStatus = "pending"

                    models.Swap.create(req.body, function(err, swap){
                        if(err){
                            res.send(err, 500)
                        } else {
                            res.send(swap.json())

                             pushNotification(req.body.switchWith,
                                req.user.firstName + ' ' + req.user.lastName + ' has requested to swap shifts with you.',
                                'Main.Schedule.ShiftSwap',
                                function(err){
                                    //Nothing to do
                                })

                        }
                    })

                })

            })
        })

    swapRouter.route('/:swapId')
        .all(app.auth)
        .get(function(req, res){
            var searchQuery = {
                _id: models.ObjectId(req.params.swapId),
                bar: req.user.barId
            }

            //Swaps are only if you are a part of it, or if you can approve any
            if(!req.user.hasPermission('schedule.approveSwap')){
                searchQuery['$or'] = [
                    { requestor: req.user._id },
                    { switchWith: req.user._id }
                ]
            }

            models.Swap.findOne(searchQuery)
                .populate('requestor')
                .populate('switchWith')
                .populate('originalShift')
                .populate('requestedShift')
                .populate('approvalManager')
                .exec(function(err, swap){
                    if(err){
                        res.send(err, 500)
                    } else if(!swap){
                        res.send(404)
                    } else {
                        res.send(swap.json())
                    }
                })
        })

    swapRouter.route('/:swapId/approve')
        /*
            Example PUT
            {
                approve: true/false,
                reason: message
            }
        */
        .put(app.auth, function(req, res){
            models.Swap.findOne({
                _id: models.ObjectId(req.params.swapId),
                bar: req.user.barId
            })
                .populate('requestor')
                .populate('switchWith')
                .exec(function(err, swap){
                    if(err){
                        res.send(err, 500)
                    } else if(!swap){
                        res.send(404)
                    } else {
                        if(swap.switchWith._id.toString() == req.user._id.toString() && swap.switchWithStatus == "pending"){

                            swap.switchWithStatus = req.body.approve ? "approved" : "declinded";
                            if(!req.body.approve){
                                swap.declineReason = req.body.reason
                            }
                            swap.updated = new Date()

                            swap.save(function(err){
                                if(err){
                                    res.send(err, 500)
                                } else if(req.body.approve){
                                    res.send(200)
                                    pushNotification(swap.requestor._id,
                                        req.user.firstName + ' ' + req.user.lastName + ' has agreed to swap shifts with you. Managers will now review the shift swap for approval.',
                                        function(err){
                                            //Nothing to do here
                                        })

                                    models.User.find({
                                        barId: req.user.barId,
                                        'permissions.schedule.approveSwap': true
                                    }, function(err, users){
                                        if(!err && users && users.length > 0){
                                            var userIds = []
                                            users.forEach(function(user){
                                                userIds.push(user._id)
                                                pushNotification(user._id,
                                                    swap.requestor.firstName + ' ' + swap.requestor.lastName + ' and ' +
                                                    req.user.firstName + ' ' + req.user.lastName + ' have agreed to swap shifts - review for approval needed.',
                                                    "Main.Schedule.ShiftSwap",
                                                    function(err){
                                                        //Nothing to do
                                                    })
                                            })

                                        }
                                    })
                                } else {
                                    res.send(200)
                                    pushNotification(swap.requestor._id,
                                        req.user.firstName + ' ' + req.user.lastName + ' has declined to swap shifts with you.',
                                        function(err){
                                            //Nothing to do
                                        })
                                }
                            })

                        } else if(req.user.hasPermission('schedule.approveSwap') && swap.approvalStatus == "pending"){

                            swap.approvalStatus = req.body.approve ? "approved" : "declined";
                            if(!req.body.approve){
                                swap.declineReason = req.body.reason
                            }
                            swap.updated = new Date()
                            swap.approvalDate = new Date()
                            swap.approvalManager = req.user._id

                            swap.save(function(err){
                                if(err){
                                    res.send(err, 500)
                                } else if(req.body.approve){
                                    res.send(200)

                                    models.Shift.update({
                                        _id: swap.requestedShift
                                    }, {
                                        user: swap.requestor._id
                                    }, function(err){
                                        //Nothing to do
                                    })

                                    models.Shift.update({
                                        _id: swap.originalShift
                                    }, {
                                        user: swap.switchWith
                                    }, function(err){
                                        //Nothing to do
                                    })

                                    pushNotification([swap.requestor._id, swap.switchWith._id],
                                        req.user.firstName + ' ' + req.user.lastName + ' has approved your shift swap request.',
                                        function(err){
                                            //Nothing to do
                                        })
                                } else {
                                    res.send(200)

                                    pushNotification([swap.requestor._id, swap.switchWith._id],
                                        req.user.firstName + ' ' + req.user.lastName + ' has denied your shift swap request.',
                                        function(err){
                                            //Nothing to do
                                        })
                                }
                            })

                        } else {
                            res.send(403)
                        }
                    }
                })
        })


    return swapRouter
};
