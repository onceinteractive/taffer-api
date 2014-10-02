var express = require('express')

module.exports = function(app, models){

    var health = express.Router()
    
    health.route('/')
        //Get my bar
        .get(function(req, res){
            res.send(200)
        })


    return health

}
