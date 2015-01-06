var express = require('express')
var async = require('async')
var uuid = require('node-uuid')

module.exports = function(app, models){

    var courses = express.Router()
    var uploadRoute = require('../Modules/adminImageUpload')(models)

    courses.route('/')
        .get(app.adminAuth, function(req, res){
            if(!req.admin.hasPermission('courses.read')){
                res.send(403)
                return
            }

            models.Course.find({
                _id: { $exists: true }
            })
                .populate('badges')
                .exec(function(err, courses){
                    var results = []

                    courses.forEach(function(course){
                        results.push(course);
                    })

                    res.send(results)
                })
        })

        /*
            Example POST:
         {
         title: String,
         description: String,
         videoLink: String,
         type: String,

         quiz: [
         {
         question: String,
         correctAnswer: String,
         reason: String,
         wrongAnswers: [String]
         }
         ],

         publishedStartDate: Date,
         publishedEndDate: Date,

         barCategories: [String]
         }
         Image upload [image] -> preview image to be shown on the phone
        */
        .post(app.adminAuth, function(req, res){
            if(!req.admin.hasPermission('courses.create')){
                res.send(403)
                return
            }

            req.body.barCategories = JSON.parse(req.body.barCategories);
            req.body.quiz = JSON.parse(req.body.quiz);


            uploadRoute(req, 'courses', function(err, keys){
                req.body.previewImageKey = keys[0];
                //req.body.badgeImage = keys[1];

                models.Course.create(req.body, function(err, course){
                    if(err){
                        res.send(err, 500);
                        console.log(err);
                    } else {
                        res.send(course)
                    }
                })
            })



        })
    /*
    courses.route('/:courseId')
        .put(app.adminAuth, function(req, res){

            models.Course.create(req.body, function(err, course){
                if(err || !course){
                    res.send(err, 500)
                } else {
                    if(req.files.image){

                        uploadRoute(req, 'courses', function(err, keys){
                            course.previewImageKey = keys[0]
                            course.save(function(err){
                                res.send(course.json())
                            })
                        })

                    } else {
                        res.send(course.json())
                    }
                }
            })
        })
        */

    courses.route('/:courseId')
        /*
            Example PUT - anything on the POST. Only difference is marking a course as published. Note-  badges not handled here.
        */
        .put(app.adminAuth, function(req, res){
            if(!req.admin.hasPermission('courses.create')){
                res.send(403)
                return
            }
            delete req.body.badges
            delete req.body.updated
            delete req.body.created

            req.body.updated = new Date()

            req.body.barCategories = JSON.parse(req.body.barCategories);
            req.body.quiz = JSON.parse(req.body.quiz);

            async.waterfall([

                function(done){
                    if(!req.files.image){
                        done(null)
                    } else {
                        console.log("In Image Uploading");
                        uploadRoute(req, 'courses', function(err, keys){
                            if(err){
                                done(err)
                            } else {

                                req.body.previewImageKey = keys;
                                //Remove old image?
                                done(null)
                            }
                        })
                    }
                },

                function(done){
                    models.Course.update({
                        _id: models.ObjectId(req.params.courseId)
                    }, req.body, function(err){
                        done(err)
                    })
                }

            ], function(err){
                if(err){
                    res.send(err, 500)
                } else {
                    res.send(200)
                }
            })

        })

        .delete(app.adminAuth, function(req, res){
            if(!req.admin.hasPermission('courses.delete')){
                res.send(403)
                return
            }

            models.Course.findOne({
                _id: models.ObjectId(req.params.courseId)
            }, function(err, course){
                if(err){
                    res.send(err, 500)
                } else if(!course){
                    res.send(404)
                } else {
                    course.remove(function(err){
                        if(err){
                            res.send(err, 500)
                        } else {
                            //We're done - send the 200 while we do clean up
                            res.send(200)

                            //Remove all shared courses
                            models.SharedCourse.find({
                                course: course._id
                            }, function(err, sharedCourses){
                                if(err){
                                    //Nothing to do I guess - die?
                                    return
                                }

                                async.parallel([

                                    function(done){
                                        async.eachLimit(sharedCourses, 10, function(sharedCourse, done){

                                                async.eachLimit(sharedCourse.to, 10, function(userId, done){

                                                    models.User.update({
                                                        _id: userId
                                                    }, {
                                                        $pull: { courses: sharedCourse._id }
                                                    }, function(err){
                                                        done(null)
                                                    })

                                                }, function(err){
                                                    done(null)
                                                })

                                            }, function(err){
                                                done(null)
                                            })
                                    },

                                    function(done){
                                        async.eachLimit(sharedCourses, 10, function(sharedCourse, done){

                                            async.eachLimit(sharedCourse.badges, 10, function(badgeId, done){

                                                models.Badge.update({
                                                    _id: badgeId
                                                }, {
                                                    $pull: { completeOn: course._id }
                                                }, function(err){
                                                    done(null)
                                                })

                                            }, function(err){
                                                done(null)
                                            })

                                        }, function(err){
                                            done(null)
                                        })
                                    }

                                ], function(err){
                                        //Removed from all the users and badges, now wipe the shared course
                                        sharedCourse.remove(function(err){
                                            done(null)
                                        })
                                })

                            })


                        }
                    })
                }
            })
        })

    courses.route('/:courseId/badges')
        .put(app.adminAuth, function(req, res){
            if(!req.admin.hasPermission('courses.create')){
                res.send(403)
                return
            }
            async.waterfall([

                function(done){
                    if(!req.files.image){
                        done(null)
                    } else {
                        console.log("In Badge uploading================================");


                        uploadRoute(req, 'courses', function(err, keys){
                            if(err){
                                console.log("In Badge uploading error");
                                done(err)
                            } else {
                                console.log("In Badge uploading else");
                                req.body.badgeImage = keys;
                                console.log(req.body);
                                //Remove old image?
                                models.Course.findOne({
                                    _id: models.ObjectId(eq.params.courseId)
                                }, function(err, course){
                                    if(err){
                                        res.send(err, 500)
                                    } else if(!course){
                                        res.send(404)
                                    } else {
                                        console.log("Update Badges in Users");
                                        models.User.update(
                                            {badges: course.badgeImage},
                                            {
                                                $set: {"badges.$": keys}

                                            }, function (err) {
                                                done(err)
                                            })
                                    }
                                })
                                done(null)
                            }
                        })
                    }
                },

                function(done){
                    console.log("In course update");
                    console.log(req.body);
                    models.Course.update({
                        _id: models.ObjectId(req.params.courseId)
                    }, req.body, function(err){
                        done(err)
                    })
                }

            ], function(err){
                if(err){
                    res.send(err, 500)
                } else {
                    res.send(200)
                }
            })

        })


        /*
            Assign / remove badges to a course
            Example PUT:
            {
                badges: [String] -> id
            }
        */
        /*
        .put(app.adminAuth, function(req, res){
            if(!req.admin.hasPermission('courses.create')){
                res.send(403)
                return
            }

            async.waterfall([

                function(done){
                    models.Course.findOne({
                        _id: models.ObjectId(req.params.courseId)
                    }, function(err, course){
                        if(!course){
                            done('No course found')
                        } else {
                            done(err, course)
                        }
                    })
                },

                function(course, done){
                    var removingBadges = [],
                        keepBadges = []
                    course.badges.forEach(function(oldBadge){
                        var kept
                        req.body.forEach(function(badge){
                            if(badge == oldBadge._id.toString()){
                                kept = true
                            }
                        })
                        if(!kept){
                            removingBadges.push(oldBadge)
                        } else {
                            keepBadges.push(oldBadge)
                        }
                    })

                    //Now, remove the course from those badges
                    async.each(removingBadges, function(badge, done){
                        models.Badge.update({
                            _id: badge._id
                        }, {
                            $pull: { completeOn: course._id }
                        }, function(err){
                            if(err){
                                done(err)
                                return 
                            }

                            //Remove the badge from the course
                            models.Course.update({
                                _id: course._id
                            }, {
                                $pull: { badges: badge._id }
                            }, function(err){
                                done(err)
                            })
                        })
                    }, function(err){
                        done(err, course, keepBadges)
                    })
                },

                function(course, keepBadges, done){
                    var newBadges = []
                    req.body.badges.forEach(function(badge){
                        var newBadge = true
                        keepBadges.forEach(function(keptBadge){
                            if(keptBadge._id.toString() == badge){
                                newBadge = false
                            }
                        })
                        if(newBadge){
                            newBadges.push(req.body.badge)
                        }
                    })

                    //Now that we have new badges, add them to the course and completeOn for each badge
                    async.each(newBadges, function(badge, done){
                        models.Course.update({
                            _id: course._id
                        }, {
                            $push: { badges: badge._id }
                        }, function(err){
                            if(err){
                                done(err)
                                return
                            }

                            models.Badge.update({
                                _id: badge._id
                            }, {
                                $push: { completeOn: course._id }
                            }, function(err){
                                done(err)
                            })
                        })
                    }, function(err){
                        done(err)
                    })
                }

            ], function(err){
                if(err){
                    res.send(err, 500)
                } else {
                    res.send(200)
                }
            })

        })*/

    courses.route('/badges')
        .get(app.adminAuth, function(req, res){
            if(!req.admin.hasPermission('courses.read')){
                res.send(403)
                return
            }

            models.Badge.find({
                _id: { $exists: true }
            })
                .populate('completedOn')
                .exec(function(err, badges){
                    var results = []

                    badges.forEach(function(badge){
                        results.push(badge.json())
                    })

                    res.send(results)
                })
        })

    return courses

}
