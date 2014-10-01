angular.module("taffer.services")
.factory("NotificationService", [
	"api", 
	"$q",
	"$rootScope",
	"spinner",
	function(api, $q, rootScope, spinner){
		return {
			get: function() {
				return api.get("notifications")
					.then(function(response) {
						return response.data;
					}, function(response) {
						return $q.reject(response.data);
				});
			},

			getNotificationCount: function() {
				spinner.override();
				return api.get("notifications/notificationCount")
					.then(function(response) {
						if(response.data && response.data.count) {
							localStorage.setItem("notificationCount", response.data.count);
						} else {
							localStorage.setItem("notificationCount", 0);
						}
						rootScope.$broadcast("notification-count:updated");
						return response.data
					}, function(response) {
						return $q.reject(response.data);
					});
			},

			getNotificationCountFromCache: function() {
				var count = localStorage.getItem("notificationCount");
				if(count) {
					return count;
				} else {
					return 0;
				}
			},

			markAsRead: function(notificationId) {
				spinner.override();
				return api.put("notifications/" + notificationId)
					.then(function(response) {
						return response.data;
					}, function(response) {
						return $q.reject(response.data);
				});
			},

			delete: function(notificationId, callback) {
				spinner.override();
				return api.delete("notifications/" + notificationId)
					.then(function(response) {
						return response.data;
					}, function(response) {
						return $q.reject(response.data);
				});
			}
		};

	}
]);