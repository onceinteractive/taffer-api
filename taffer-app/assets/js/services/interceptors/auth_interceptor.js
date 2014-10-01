angular.module("taffer.services")
.factory("authInterceptor", [
	"$rootScope",
	"$q",
	"IntervalService",
	function(rootScope, q, intervalService) {
		return {
			responseError: function(rejection) {
				if(rejection.status === 401 &&
					rejection.config.url.indexOf("login") < 0 &&
					rejection.config.url.indexOf("rebuild") < 0) {
					console.log("caught");
					intervalService.cancelAll();
					rootScope.$broadcast("auth:login-required");
				}
				return q.reject(rejection);
			}
		};
	}
]);
