module.exports = function(models){

	return function(req, res, next){
		console.log("================auth====1=================");
		if(!req.signedCookies
			|| !req.signedCookies.id
			|| !req.signedCookies.token){
			console.log("================auth====2=================");
			res.send(401)
		} else {
			console.log("================auth====3=================");
			models.User.findOne({
				_id: req.signedCookies.id
			}, function(err, user){
				if(err || !user){
					console.log("================auth====4=================");
					res.send(401)
				} else {
					console.log("================auth====5=================");
					if(req.signedCookies.token != user.sessionToken){
						console.log("================auth====6=================");
						res.send(401)
					} else if(user.locked){
						res.send({ locked: true }, 401)
					} else {
						console.log("================auth====7=================");
						req.user = user
						next()
					}
				}
			})

		}
	}

}