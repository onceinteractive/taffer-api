module.exports = function(models){

	return function(req, res, next){
		if(!req.signedCookies
			|| !req.signedCookies.id
			|| !req.signedCookies.token){
			console.log("=============user signed cookies not found ==================");
			res.send(401)
		} else {
			models.User.findOne({
				_id: req.signedCookies.id
			}, function(err, user){
				if(err || !user){
					console.log("================user not found================");
					res.send(401)
				} else {
					if(req.signedCookies.token != user.sessionToken){
						console.log("================user signed cookie not valid================");
						res.send(401)
					} else if(user.locked){
						console.log("================user locked================");
						res.send({ locked: true }, 401)
					} else {
						req.user = user
						next()
					}
				}
			})

		}
	}

}