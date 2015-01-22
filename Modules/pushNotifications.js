var async = require('async');
var GCM = require('node-gcm');

if(!process.env.GCM_SENDER_ID) {
	process.env.GCM_SENDER_ID = 'AIzaSyDZ2JnJMyOMbEugiqdHTihvh8HTIWxKn1Q';
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
			console.log("..........1.............");
			if(err) {
				console.log("..........2.............");
				finished(err);
			} else {
				console.log("..........3.............");
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
					console.log("..........4.............");
					finished();
				});
			}
		});

		function sendGCM(userDeviceObject, message, pageUrl, done) {
			console.log("..........1 1.............");
			console.log(JSON.stringify(userDeviceObject.googles));
			if(userDeviceObject.googles.length > 0) {
				console.log("..........22.............");
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
				console.log("..........33.............");
				done();
			}
		}

		function sendAPN(userDeviceObject, message, pageUrl, done) {

			console.log("..........444.............");
			if(userDeviceObject.apples.length > 0) {
				console.log("..........555.............");
				async.each(userDeviceObject.apples, function(appleToken, callback) {

					var unreadCount = 1;//userDeviceObject.unread + 1;

					agent.createMessage()
						.device(appleToken)
						.alert(message)
						.badge(unreadCount)
						.sound('default')
						.set('pageUrl', pageUrl)
						.send(); // This could accept a callback, but it doesn't do what we think it does
					callback();
				}, function(err) {
					console.log("..........666.............");
					console.log(err);
					done();
				});
			} else {
				var unreadCount = userDeviceObject.unread + 1;

				agent.createMessage()
					.device(userDeviceObject)
					.alert(message)
					.badge(unreadCount)
					.sound('default')
					.set('pageUrl', pageUrl)
				done();
			}
		}
	}

	return pushNotifications;
}