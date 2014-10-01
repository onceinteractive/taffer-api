angular.module("taffer.app")
.config([
	"$stateProvider",
	function(stateProvider) {
		stateProvider.state("Main.Notifications", {
			url: "/notifications",
			views: {
				"notifications": {
					templateUrl: "views/main/notifications/notifications.html",
					controller: "NotificationsCtrl",
					resolve: {
						NOTIFICATIONS: ["NotificationService", function(notificationService) {
							return notificationService.get().catch(function(){
								return [];
							});
						}]
					}
				}
			}
		});
	}
]);
