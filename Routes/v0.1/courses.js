var express = require('express')
var async = require('async');

module.exports = function(app, models){

    var courses = express.Router()

    var pushNotification = require('../../Modules/pushNotifications')(app, models)

    courses.route('/')
        //Get my bar
        .get(app.auth, function(req, res){
            if(req.user.hasPermission('courses.viewAll')){
                models.Bar.findOne({
                    _id: req.user.barId
                }, function(err, bar){
                    if(err || !bar){
                        res.send(err, 500)
                        return
                    }

                    models.Course.find({
                        published: true,
                        publishedStartDate: { $lte: new Date() },
                        publishedEndDate: { $gte: new Date() },
                        $or: [
                            { barCategories: 'All' },
                            { barCategories: bar.category }
                        ]
                    })
                        .populate('badges')
                        .exec(function(err, courses){
                            if(err){
                                res.send(err, 500)
                            } else if(courses.length == 0){
                                res.send([])
                            } else {
                                var results = []
                                courses.forEach(function(course){
                                    results.push(course.json(req.user))
                                })
                                res.send(results)
                            }
                        })
                })
            } else {
                //Populate the user to see if they've been assigned any courses

                if(!req.user.courses || req.user.courses.length == 0){
                    res.send([])
                } else {

                    models.SharedCourse.find({
                        barId: req.user.barId,
                        to: req.user._id
                    })
                        .populate('from')
                        .exec(function(err, sharedCourses){
                            if(err){
                                res.send(err, 500)
                                return
                            } else if(!sharedCourses || sharedCourses.length == 0){
                                res.send([])
                                return
                            }

                            var courses = []
                            async.each(sharedCourses, function(sharedCourse, done){
                                models.Course.findOne({
                                    _id: sharedCourse.course,

                                    published: true,
                                    publishedStartDate: { $lte: new Date() },
                                    publishedEndDate: { $gte: new Date() }
                                })
                                    .populate('badges')
                                    .exec(function(err, course){
                                        if(err){
                                            done(err)
                                        } else if(!course){
                                            done(null)
                                        } else {
                                            var jsonCourse = course.json(req.user)
                                            jsonCourse.from = sharedCourse.from.json();
                                            jsonCourse.message = sharedCourse.message;
                                            courses.push(jsonCourse);
                                            // courses.push({
                                            //     from: sharedCourse.from.json(),
                                            //     course: course.json(req.user)
                                            // })
                                            done(null)
                                        }
                                    })

                            }, function(err){
                                res.send(courses)
                            })


                        })

                }

            }

        })

    courses.route('/whocanisendto')
        //Who can I send courses to?
        .get(app.auth, function(req, res){
            req.user.courseAssignableUsers(function(err, users){
                if(err){
                    res.send(err, 500)
                } else {
                    var results = []
                    users.forEach(function(user){
                        results.push(user.json())
                    })

                    res.send(results)
                }
            })
        })

    courses.route('/:courseId')
        .get(app.auth, function(req, res){
            models.Course.findOne({
                _id: models.ObjectId(req.params.courseId),
                published: true,
                publishedStartDate: { $lte: new Date() },
                publishedEndDate: { $gte: new Date() }
            }, function(err, course){
                if(err){
                    res.send(err, 500)
                } else if(!course){
                    res.send(404)
                } else {
                    res.send(course.json(req.user))
                }
            })
        })

        /*
            For now, just whether or not a course has been completed and / or viewed
            Example POST:
            {
                complete: boolean,
                viewed: boolean
            }
        */
        .put(app.auth, function(req, res){
            models.Course.findOne({
                _id: models.ObjectId(req.params.courseId)
            })
                .populate('badges')
                .exec(function(err, course){
                if(err){
                    res.send(err, 500)
                } else if(!course){
                    res.send(404)
                } else {

                    var push = {}
                    if(req.body.complete){
                        push.completedCourses = models.ObjectId(req.params.courseId)
                    }
                    if(req.body.viewed){
                        push.viewedCourses = models.ObjectId(req.params.courseId)
                    }

                    models.User.update({
                        _id: req.user._id
                    }, {
                        $addToSet: push
                    }, function(err){
                        if(err){
                            res.send(err, 500)
                            return
                        }

                        var result = {
                            complete: req.body.complete,
                            viewed: req.body.viewed,
                            badges: []
                        }

                        //If there's no badges to award, return
                       /* if(!course.badges
                            || course.badges.length == 0
                            || !req.body.complete){
                            res.send(result)
                            return
                        }
*/
                        //Update the user model with populated badges
                        models.User.findOne({
                            _id: req.user._id
                        })

                            .exec(function(err, user){
                                if(err || !user){
                                    res.send(err, 500)
                                    return
                                }
                                models.User.update({
                                    _id: user._id
                                }, {
                                    $push: {
                                        badges: course.badgeImage
                                    }
                                }, function(err){
                                    //Do nothing for now
                                })
                                result.badges.push(course.badgeImage)
                                res.send(result)
                                /*async.each(course.badges, function(badge, done){
                                    if(req.user.badges && req.user.badges.length > 0){
                                        var isCompletedAlready
                                        user.badges.forEach(function(earnedBadge){
                                            if(earnedBadge._id.toString() == badge._id.toString()){
                                                isCompletedAlready = true
                                            }
                                        })
                                        if(isCompletedAlready){
                                            done(null)
                                            return
                                        }
                                    }


                                    if(badge.isComplete(user)){
                                        models.User.update({
                                            _id: user._id
                                        }, {
                                            $push: {
                                                badges: badge._id
                                            }
                                        }, function(err){
                                            //Do nothing for now
                                        })

                                        result.badges.push(badge)
                                        done(null)
                                    } else {
                                        done(null)
                                    }


                                }, function(err){
                                    res.send(result)
                                })*/



                            })
                    })

                }
            })
        })

    courses.route('/:courseId/users')

        /*
            EXAMPLE POST:
            {
                users: [String] - List of user ids
                message: String - message to send to users
            }
        */
        .post(app.auth, function(req, res){
            if(!req.user.hasPermission('courses.share')){
                res.send(403)
                return
            }

            req.user.courseAssignableUsers(function(err, users){
                if(err){
                    res.send(err, 500)
                    return
                }

                var found = []
                req.body.users.forEach(function(user){
                    users.forEach(function(foundUser){
                        if(user == foundUser._id.toString()){
                            found.push(foundUser._id)
                        }
                    })
                })

                if(found.length != req.body.users.length){
                    res.send('Not all users assigned could be assigned', 500)
                    return
                }

                models.Course.findOne({
                    _id: models.ObjectId(req.params.courseId),
                    published: true,
                    publishedStartDate: { $lte: new Date() },
                    publishedEndDate: { $gte: new Date() }
                }, function(err, course){
                    if(err){
                        res.send(err, 500)
                    } else if(!course){
                        res.send(404)
                    } else {
                        models.SharedCourse.create({
                            barId: req.user.barId,
                            course: course._id,
                            from: req.user._id,
                            to: [],
                            message: req.body.message
                        }, function(err, sharedCourse){
                            if(err || !sharedCourse){
                                res.send(err, 500)
                            } else {
                                //Track how many people we need to add to share courses
                                var shared = []

                                async.each(found, function(userId, done){
                                    models.User.findOne({
                                        _id: userId
                                    })
                                        .populate('courses')
                                        .exec(function(err, user){
                                            if(err){
                                                done(err)
                                                return
                                            }

                                            var foundCourse
                                            user.courses.forEach(function(sharedCourse){
                                                if(sharedCourse.course.toString() == course._id.toString()){
                                                    foundCourse = sharedCourse
                                                }
                                            })

                                            if(foundCourse){
                                                done(null)
                                                return
                                            }

                                            models.User.update({
                                                _id: userId
                                            }, {
                                                $push: { courses: sharedCourse._id }
                                            }, function(err){
                                                if(err){
                                                    done(err)
                                                } else if(!err){
                                                    shared.push(userId)
                                                    pushNotification(userId,
                                                        req.user.firstName + ' ' + req.user.lastName + ' has sent you a course to view',
                                                        'Main.Courses.List',
                                                        function(err){
                                                            //Do nothing at this point
                                                        }
                                                    )
                                                    done(null)
                                                }
                                            })

                                        })

                                }, function(err){
                                    if(err){
                                        res.send(err, 500)
                                    } else if(shared.length > 0){
                                        models.SharedCourse.update({
                                            _id:sharedCourse._id
                                        }, {
                                            to: shared
                                        }, function(err){
                                            if(err){
                                                res.send(err, 500)
                                            } else {
                                                res.send(200)
                                            }
                                        })
                                    } else {
                                        res.send('All users have had this course shared with them already', 200)
                                    }
                                })
                            }
                        })

                    }
                })

            })

        })


    return courses

}
