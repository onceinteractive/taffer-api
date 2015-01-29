module.exports = function(models){

	return function(req, res, next){
		console.log("=======1======cookie token get=====1======"+JSON.stringify(req.signedCookies));
		if(!req.signedCookies
			|| !req.signedCookies.id
			|| !req.signedCookies.token){
			res.send(401)
		} else {
			models.User.findOne({
				_id: req.signedCookies.id
			}, function(err, user){
				if(err || !user){
					res.send(401)
				} else {
					if(req.signedCookies.token != user.sessionToken){
						console.log("===2====cookie token get===2==="+req.signedCookies.token);
						res.send(401)
					} else if(user.locked){
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