angular.module("taffer.services")
.factory("spinnerInterceptor", [
	"$q",
	"spinner",
	function(q, spinner) {
		return {
			request: function(config) {
				spinner.start();
				return config;
			},

			requestError: function(rejection) {
				spinner.stop();
				return q.reject(rejection);
			},

			response: function(response) {
				spinner.stop();
				return response;
			},

			responseError: function(rejection) {
				spinner.stop();
				return q.reject(rejection);
			}
		};
	}
]);
