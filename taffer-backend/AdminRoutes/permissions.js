var express = require('express')
var async = require('async')

module.exports = function(app, models){

    var permissions = express.Router()

    permissions.route('/admins')

        .get(app.adminAuth, function(req, res){
            res.send(models.Admin.permissionsExplanations)
        })

    permissions.route('/users')

        .get(app.adminAuth, function(req, res){
            res.send(models.User.permissionsExplanations)
        })


    return permissions

}
