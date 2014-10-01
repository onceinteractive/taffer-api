angular.module("taffer.services")
.factory("PushNotificationsFactory", function() {
	var pushNotificationsFactory;

	var pushNotificationsFactory = function(registrationCallback, notificationHandlerCallback) {

		if(typeof window.plugins === "undefined") {
			console.log("PhoneGap plugins not found. Push notifications not initialized.");
			registrationCallback(null);
		}

		if(window.plugins && window.plugins.pushNotification) {
			var pushNotification = window.plugins.pushNotification;

			var gcmSuccessHandler = function(result) {
				console.log("Successfully registered GCM notifications.");
			};

			var gcmErrorHandler = function(result) {
				console.log("Error registering GCM notifications: " + JSON.stringify(result));
			};

			var apnSuccessHandler = function(deviceToken) {
				console.log("Successfully registered APN notifications.");
				if(deviceToken) {
					registrationCallback(deviceToken);
				} else {
					if(navigator.notification) {
						navigator.notification.alert("We were unable to register your device. You will not be able to receive push notifications.", function() {
							registrationCallback(null);
						}, "Registration Failure");
					} else {
						alert("We were unable to register your device. You will not be able to receive push notifications.");
						registrationCallback(null);
					}
				}
			};

			var apnErrorHandler = function(error) {
				return console.log("Error registering APN notifications: " + JSON.stringify(error));
			};

			if(device.platform === "Android") {
				pushNotification.register(gcmSuccessHandler, gcmErrorHandler, {
					senderID: "533744729620",
					ecb: "onNotificationGCM"
				});
			} else if(device.platform === "iOS") {
				pushNotification.register(apnSuccessHandler, apnErrorHandler, {
					badge: true,
					sound: true,
					alert: true,
					ecb: "onNotificationAPN"
				});
			} else {
				console.log("Unsupported device!");
			}

			window.onNotificationGCM = function(e) {
				switch(e.event) {
					case "registered":
						if(e.regid.length > 0) {
							registrationCallback(e.regid);
						} else {
							if(navigator.notification) {
								navigator.notification.alert("We were unable to register your device. You will not be able to receive push notifications.", function() {}, "Registration Failure");
								registrationCallback(null);
							} else {
								alert("We were unable to register your device. You will not be able to receive push notifications.");
								registrationCallback(null);
							}
						}
						break;
					case "message":
						if(e.foreground) {
							notificationHandlerCallback(e);
						}
						break;
					case "error":
						console.log("GCM Error: " + e.msg);
						break;
					default:
						console.log("An unknown messaging event has occurred.");
				}
			};

			window.onNotificationAPN = function(e) {
				if(e.foreground) {
					notificationHandlerCallback(e);
				}
			};

		}
	}

	return pushNotificationsFactory;
});
