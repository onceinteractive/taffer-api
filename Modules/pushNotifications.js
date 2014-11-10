var async = require('async');
var GCM = require('node-gcm');

if(!process.env.GCM_SENDER_ID) {
	process.env.GCM_SENDER_ID = 'AIzaSyCp3ZgFZDOGa_gbGJ77yFedFA5zJG5TOFs';
}

module.exports = function(app, models) {

	var agent

	if(!models){
		models = app
		agent = models.APNAgent
	} else {
		agent = app.get('apnagent');
	}

	var pushNotifications;

	pushNotifications = function(userIds, message, pageUrl, finished) {
		if(!finished){
			finished = pageUrl
			pageUrl = null
		}
		if(!userIds){
			finished('No user ids provided')
			return
		}
		if(typeof userIds != 'array'){
			userIds = [userIds]
		}

		var sender = new GCM.Sender(process.env.GCM_SENDER_ID);

		var userDevices = [];
		async.each(userIds, function(userId, next) {
			var mongooseUserId;

			if(typeof userId === 'string') {
				mongooseUserId = models.ObjectId(userId);
			} else {
				mongooseUserId = userId;
			}

			models.User.findOne({ _id: mongooseUserId }).populate('notifications').populate('devices').exec(function(err, user) {
				if(err) {
					next(err);
				} else {

					var notification = {
						message: message,
						sendDate: new Date(),
						shouldShow: true,
						status: 'unread',
						pageUrl: pageUrl
					};

					models.Notification.create(notification, function(err, savedNotification) {
						if(err) {
							next(err);
						} else {
							user.update({
								$push: {
									notifications: savedNotification._id
								}
							}, function(err) {
								if(err) {
									next(err);
								} else {
									userDevices.push({googles: user.getAndroidTokens(), apples: user.getAppleTokens(), unread: user.getUnreadMessagesCount()});
									next();
								}
							});
						}
					});
				}

			});
		}, function(err) {
			if(err) {
				finished(err);
			} else {
				// Time to send messages
				async.each(userDevices, function(userDeviceObject, cb) {
					sendGCM(userDeviceObject, message, pageUrl, function(err) {
						if(err) {
							console.log("Error sending Android messages: " + err);
						}

						sendAPN(userDeviceObject, message, pageUrl, function() {
							cb();
						});
					});
				}, function(err) {
					console.log("Error sending Apple messages: " + err);
					finished();
				});
			}
		});

		function sendGCM(userDeviceObject, message, pageUrl, done) {
			if(userDeviceObject.googles.length > 0) {
				var gcmMessage = new GCM.Message();
				var sender = new GCM.Sender(process.env.GCM_SENDER_ID);

				var unreadCount = userDeviceObject.unread + 1;

				gcmMessage.addData('message', message);
				gcmMessage.addData('title', "Taffer's BAR HQ");
				gcmMessage.addData('msgcnt', unreadCount);
				if(pageUrl){
					gcmMessage.addData('pageUrl', pageUrl);
				}
				gcmMessage.timeToLive = 1800 // 30 minutes - Duration in seconds to hold in GCM and retry before timing out

				sender.send(gcmMessage, userDeviceObject.googles, 3, function(err, result) {
					done(err);
				});
			} else {
				done();
			}
		}

		function sendAPN(userDeviceObject, message, pageUrl, done) {
console.log('Apn called');
			if(userDeviceObject.apples.length > 0) {
				async.each(userDeviceObject.apples, function(appleToken, callback) {
					var unreadCount = userDeviceObject.unread + 1;

					agent.createMessage()
						.device(appleToken)
						.alert(message)
						.badge(unreadCount)
						.sound('default')
						.set('pageUrl', pageUrl)
						.send(); // This could accept a callback, but it doesn't do what we think it does
					callback();
				}, function(err) {
					console.log(err);
					done();
				});
			} else {
				done();
			}
		}
	}

	return pushNotifications;
}
