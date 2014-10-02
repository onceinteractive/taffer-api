module.exports = function(models){

	return function(req, res, next){
		if(!req.signedCookies
			|| !req.signedCookies.id
			|| !req.signedCookies.token){
			res.send(401)
		} else {
			models.Admin.findOne({
				_id: req.signedCookies.id
			}, function(err, admin){
				if(err || !admin){
					res.send(401)
				} else {
					if(req.signedCookies.token != admin.sessionToken){
						res.send(401)
					} else if(admin.locked){
						res.send({ locked: true }, 401)
					} else {
						req.admin = admin
						next()
					}
				}
			})

		}
	}

}