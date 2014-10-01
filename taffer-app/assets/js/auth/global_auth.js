angular.module("taffer.controllers")
.controller("GlobalAuthCtrl", [
	"$scope",
	"$state",
	"api",
	"PushNotificationsFactory",
	"TooltipService",
	"$rootScope",
	"$interval",
	"IntervalService",
	"MessageService",
	"NotificationService",
	"BACKBUTTONSTATES",
	"AuthService",
	"KeenIO",
	function(scope, state, api, PushNotificationsFactory, tooltips, rootScope, interval, intervalService, messageService, notificationService, backButtonStates, auth, keenIO) {
		scope.deviceData = null;
		scope.notificationCount = null;
		scope.pushNotificationsDisabled = false;
    	// scope.thinUI = true; //thinUI applies only to login screen for now.

    // ******************************************** LISTENERS *****************************************
		document.addEventListener("resume", function() {
			rootScope.$broadcast("app-resume");
		});

		document.addEventListener("offline", function() {
			rootScope.networkError = true;
		});

		document.addEventListener("online", function() {
			rootScope.networkError = false;
		});

		document.addEventListener("backbutton", function(e){
			if(backButtonStates[state.current.name]){
				state.go(backButtonStates[state.current.name])
			}
		}, false);

		// ******************************************** EVENTS *****************************************
		scope.$on("auth:login-required", function(event) {
			console.log("Redirecting to Login");
			auth.kickUser();
		});

		scope.$on("auth:no-login-required", function(event) {
	     scope.thinUI = false;
		});

		scope.$on("login:success", function() {
			var loadMessages = function() {
				messageService.getMessages()
					.then(function(data) {
						// Nothing to do
					}, function(error) {
						console.log(error);
					});
			}

			var loadNotificationCount = function() {
				notificationService.getNotificationCount()
					.then(function(data) {
						// Nothing to do
					}, function(error) {
						console.log(error);
					});
			}

			loadMessages();
			intervalService.interval(loadMessages, 180000); // 3 min

			loadNotificationCount();
			intervalService.interval(loadNotificationCount, 300000); // 5 min
		});

		scope.$on("notification-count:updated", function() {
			var notificationCount = notificationService.getNotificationCountFromCache();
			if(notificationCount) {
				scope.updateNotificationCount(notificationCount);
			} else {
				scope.updateNotificationCount(0);
			}
		});

		// **************************** PUSH NOTIFICATIONS REGISTRATIONS *********************************
		(function() {
			new PushNotificationsFactory(function(token) {
				if(token) {
					var deviceType = device && device.platform ? device.platform : "";
					var deviceVersion = device && device.version ? device.version: "";

					scope.deviceData = {deviceToken: token, deviceType: deviceType, deviceVersion: deviceVersion};
				} else {
					scope.pushNotificationsDisabled = true;
				}
			}, function(receivedMessageEvent) {
				// Parameters on message event:
				// alert = actual message
				// badge = number of unread messages
				// pageUrl = url to direct user to
				// sound = sound to play
				if(receivedMessageEvent && receivedMessageEvent.badge) {
					// If we're in messages, update the cache
					if(receivedMessageEvent.pageUrl.indexOf('Messages') > 0) {
						messageService.getMessages()
							.then(function(data) {
								// Nothing to do
							}, function(error) {
								console.log(error);
							});
					}

					if(state.current.name.indexOf('Messages') < 0) {
						var parsedInt = parseInt(receivedMessageEvent.badge);
						if(!isNaN(parsedInt)) {
							localStorage.setItem("notificationCount", parsedInt);
							scope.notificationCount = parsedInt;
							scope.$apply();
						}
					}
				}

			});
		})();

		// **************************** GLOBAL/PARENT FUNCTIONS *********************************
		scope.updateNotificationCount = function(count) {
			localStorage.setItem("notificationCount", count);
			scope.notificationCount = count;
		};

		scope.saveDeviceData = function() {
			if(scope.deviceData && auth.getUser()) {
				var promise = api.post("users/device", scope.deviceData);
				promise.success(function(data, status, headers, config) {
					console.log("Device registered for Push Notifications.");
				});

				promise.error(function(data, status, headers, config) {
					console.log(status);
					console.log(data);
				});
			}
		};

		rootScope.help = function() {
			tooltips.showTooltips();
		}

		rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
			var changeEvent = {
				toState: toState,
				fromState: fromState,
			}

			var user = auth.getUser()

			if(user){
				changeEvent.user = user._id
				changeEvent.bar = user.barId
			}

			if(typeof(device) !== "undefined"){
				changeEvent.device = device
			} else {
				changeEvent.device = { platform: 'web' }
			}
			keenIO.addEvent("stateChange", changeEvent)
		})

	}
]);
