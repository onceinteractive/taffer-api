var async = require('async')

module.exports = function(models){

	var daemon = {
		name: 'facebookTokenExpiration_v0.1',
		options: {}
	}

	var pushNotification = require('./../Modules/pushNotifications')(models)
	
	daemon.job = function(job, done){

		models.User.findOne({
			_id: job._id
		}, function(err, user){
			if(err){
				done(err)
				return
			} else if(!user){
				done('No such user found')
				return
			}

			//Get the seconds until expiration
			var secondsUntilExpiration = ( facebookAccessTokenExpiration.getTime() - (new Date()).getTime() ) / 1000

			//If the expiration is within 48 hours (half hour for wiggle room), set the new reminder to 24 hours. Otherwise set it to 48 hours.
			var newExpirationDate = new Date()
			if(secondsUntilExpiration <= ( 60 * 60 * 48.5 * 1000 ) ){
				newExpirationDate.setDate( newExpirationDate.getDate() + 1 )
			} else {
				newExpirationDate.setDate( newExpirationDate.getDate() + 2 )
			}

			models.Agenda.create('facebookTokenExpiration_v0.1', {
				_id: user._id
			})
				.schedule(newExpirationDate)
				.save(function(err, task){
					if(err){
						done(err)
					} else {

						models.User.update({
							_id: user._id
						}, {
							facebookTokenExpirationTask: task.attr._id
						}, function(err){
							if(err){
								done(err)
							} else {

								pushNotification(user._id,
									'We need to renew your Facebook Credentials',
									'CHANGE ME',
									function(err){
										done(err)
									}
								)

							}
						})

					}
				})

		})
		
	}


	return daemon

}