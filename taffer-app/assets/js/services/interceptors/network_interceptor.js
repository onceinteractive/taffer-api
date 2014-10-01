angular.module("taffer.services")
.factory("networkInterceptor", [
	"$rootScope",
	"$q",
	"IntervalService",
	function(rootScope, q, intervalService) {
		return {
			response: function(response) {
				rootScope.online = false;
				return response;
			},

			responseError: function(rejection) {
				if(rejection.status === 503 &&
					rejection.config.url.indexOf("login") < 0 &&
					rejection.config.url.indexOf("rebuild") < 0) {
					rootScope.networkError = true;
				} else {
					rootScope.networkError = false;
				}
				return q.reject(rejection);
			}
		};
	}
]);
