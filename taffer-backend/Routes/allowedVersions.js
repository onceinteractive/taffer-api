var express = require('express')

module.exports = function(app, models){

    var allowedVersions = express.Router()
    
    allowedVersions.route('/')
        //Get my bar
        .get(function(req, res){
            res.send({
            	allowed: ["v0.1"],
            	mostRecent: "v0.1"
            })
        })


    return allowedVersions

}
