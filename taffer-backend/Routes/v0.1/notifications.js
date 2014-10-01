var express = require('express');
var _ = require('underscore');

module.exports = function(app, models) {

	var pushNotifications = require('../../Modules/pushNotifications')(app, models);
	var notification = express.Router();

	notification.route('/')
		.all(app.auth)
		// Build a new push notification
		.post(function(req, res) {
			var userIds = req.body.userIds;
			var message = req.body.message;
			var pageUrl = req.body.pageUrl;

			if(userIds.length == 0 || !message) {
				res.send(500, "Users were no selected or message was empty.");
			}

			pushNotifications(userIds, message, pageUrl, function(err) {
				if(err) {
					console.log("Could not save and send push notification: " + err);
					res.send(500, "Notification could not be sent.");
				} else {
					res.send();
				}
			});

		})

		.get(function(req, res) {
			models.User.findOne(req.user._id).populate('notifications').exec(function(err, user){
				if(err || !user){
					res.send(404, 'Could not find requested user');
				} else {
					var shownNotifications = [];
					user.notifications.forEach(function(notification) {
						if(notification.shouldShow) {
							shownNotifications.push(notification);
						}
					});

					var sortedNotifications = _.sortBy(shownNotifications, function(shownNotification) {
						return shownNotification.sendDate;
					});

					res.send(sortedNotifications.reverse());
				}
			});
		});

	notification.route('/:notificationId')
		.all(app.auth)
		.put(function(req, res) {
			models.Notification.findOne({_id: req.params.notificationId}, function(err, notification) {
				if(err || !notification){
					// Don't do anything. Not important if we can't update read status
					res.send();
				} else {
					notification.status = 'read';
					notification.save(function(err) {
						if(err) {
							res.send(err, 500);
						} else {
							res.send();
						}
					});
				}
			});
		})

		.delete(function(req, res) {
			models.Notification.findOne({_id: req.params.notificationId}, function(err, notification) {
				if(err || !notification){
					res.send(404, 'Could not delete requested notification');
				} else {
					notification.shouldShow = false;
					notification.save(function(err) {
						if(err) {
							res.send(err, 500);
						} else {
							res.send();
						}
					});
				}
			});
		});

	notification.route('/notificationCount')
		.all(app.auth)
		.get(function(req, res) {
			models.User.findOne(req.user._id).populate('notifications').exec(function(err, user){
				if(err || !user){
					res.send(404, 'Could not find requested user');
				} else {
					var shownNotifications = [];
					user.notifications.forEach(function(notification) {
						if(notification.shouldShow && notification.status === 'unread') {
							shownNotifications.push(notification);
						}
					});

					res.send({count: shownNotifications.length});
				}
			});
		});

	return notification;
};
