angular.module("taffer.services")
.factory("CourseService", [
	"api", 
	"$q",
	"$rootScope",
	"promiseCache",
	function(api, $q, rootScope, promiseCache){
		return {
			getCourses: function() {
				return promiseCache({
					promise: function() {
						return api.get("courses").then(function(response) {
							return response.data;
						}, function(response) {
							return $q.reject(response.data);
						});
					},
					expireOnFailure: function() {
						return true;
					},
					ttl: 14400000, // 4 hours
					key: "coursesCache",
					localStorageEnabled: true
				});
			},

			getCourseRecipients: function() {
				return promiseCache({
					promise: function() {
						return api.get("courses/whocanisendto").then(function(response) {
							return response.data;
						}, function(response) {
							return $q.reject(response.data);
						});
					},
					expireOnFailure: function() {
						return true;
					},
					ttl: 300000, // 5 minutes
					key: "courseRecipientsCache",
					localStorageEnabled: true
				});
			},

			update: function(courseId, updateObject) {
				promiseCache.remove("coursesCache", false); // Invalidate cache
				rootScope.$broadcast("spinner:override-on");
				return api.put("courses/" + courseId, updateObject)
					.then(function(response) {
						rootScope.$broadcast("spinner:override-off");
						return response.data;
					}, function(response) {
						rootScope.$broadcast("spinner:override-off");
						return $q.reject(response.data);
					});
			},

			share: function(courseId, shareObject) {
				return api.post("courses/" + courseId + "/users", shareObject)
					.then(function(response) {
						return response.data;
					}, function(response) {
						return $q.reject(response.data);
					});
			}
		};

	}
]);


