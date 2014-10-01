var express = require('express')
var async = require('async')

module.exports = function(app, models){

    var admins = express.Router()

    admins.route('/')

        .get(app.adminAuth, function(req, res){

            res.send(req.admin.json())

        })

        .post(app.adminAuth, function(req, res){
            if(!req.admin.hasPermission('admins.create')){
                res.send(403)
                return
            }

            var password = req.body.password
            delete req.body.password

            models.Admin.create(req.body, function(err, admin){
                admin.setPassword(password, function(err){
                    res.send(admin.json())
                })
            })
        })

    admins.route('/permissions')
        //Return all the potential permissions
        .get(app.adminAuth, function(req, res){
            res.send({
                admins: ['create', 'read', 'edit'],
                users: ['read', 'edit'],
                bars: ['read']
            })
        })

    //get all admins.
    admins.route('/all')
        .get(app.adminAuth, function(req, res){
        if(!req.admin.hasPermission('admins.read')){
            res.send(403)
            return
        }

        models.Admin.find({
            _id: {
                $exists: true
            }
        }, function(err, foundAdmins){
            var admins = []

            foundAdmins.forEach(function(admin){
                admins.push(admin.json())
            })

            res.send(admins)
        })
    })


    admins.route('/:adminId')

        //Update the user
        .put(app.adminAuth, function(req, res){
            if(!req.admin.hasPermission('admins.edit')){
                res.send(403)
                return
            }

            async.waterfall([

                function(done){
                    models.Admin.findOne({
                        _id: req.params.adminId
                    }, function(err, admin){
                        if(err || !admin){
                            res.send(404, 'Could not find requested admin')
                            done('no admin')
                        } else {
                            done(null, admin)
                        }
                    })
                },

                function(admin, done){
                    if(req.body.password){
                        admin.setPassword(req.body.password, function(err){
                            if(err){
                                res.send(500, err)
                            } else {
                                delete req.body.password
                                done(null, admin)
                            }
                        })
                    } else {
                        done(null, admin)
                    }
                },

                //Update each attribute of the admin as per req.body
                function(admin, done){
                    Object.keys(req.body).forEach(function(update){
                        //Make sure that the update is actually a schema field for users
                        if(models.User.editableFields.indexOf(update) != -1){
                            admin[update] = req.body[update]
                        }
                    })

                    if(!req.body.updated){
                        admin.updated = new Date()
                    }

                    done(null, admin)
                },

                function(admin, done){
                    admin.save(function(err){
                        if(err){
                            res.send(500, err)
                        } else {
                            done(null, admin)
                        }
                    })
                }

            ], function(err, admin){
                if(!err){
                    res.send(admin.json())
                }
            })
        })

        //Get User if allowed
        .get(app.adminAuth, function(req, res){
            if(!req.admin.hasPermission('admins.read')){
                res.send(403)
                return
            }

            models.Admin.findOne({
                _id: req.params.adminId
            }, function(err, admin){
                if(err || !admin){
                    res.send(404)
                } else {
                    res.send(admin.json())
                }
            })
        })

    return admins

}
