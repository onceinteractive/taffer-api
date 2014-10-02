var express = require('express')
var async = require('async')

module.exports = function(app, models){

    var permissions = express.Router()

    permissions.route('/')
        .get(app.auth, function(req, res){
            res.send(models.User.permissionsExplanations)
        })


    return permissions

}
