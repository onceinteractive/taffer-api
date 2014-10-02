var express = require('express')
var uuid = require('node-uuid');

module.exports = function(app, models){

    var rebuild = express.Router()

    rebuild.route('/')
	    /*
			Example POST:
			{
				id: String,
				token: String
			}
	    */
    	.post(function(req, res){
    		models.User.findOne({
    			_id: models.ObjectId(req.body.id),
    			sessionToken: req.body.token
    		}, function(err, user){
    			if(err || !user){
    				res.send(401)
    			} else {
    				res.cookie('id', user._id, { signed: true })
					var token = uuid.v4()
					res.cookie('token', token, { signed: true })
					user.update({
						sessionToken: token,
						lastLogin: new Date()
					}, function(err){
						if(err){
							res.send(401)
						} else {
							var json = user.json()
							json.token = token
							res.send(json)
						}
					})
    			}
    		})
    	})



    return rebuild

}
