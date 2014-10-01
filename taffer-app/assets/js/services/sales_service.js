angular.module("taffer.services")
.factory("SalesService", [
	"api", 
	"$q",
	"promiseCache",
	function(api, $q, promiseCache){
		return {
			getDashboardData: function() {
				return promiseCache({
					promise: function() {
						return api.get("sales/dashboard").then(function(response) {
							return response.data;
						}, function(response) {
							return $q.reject(response.data);
						});
					},
					expireOnFailure: function() {
						return true;
					},
					ttl: 21600000, // 6 hours
					key: "salesDashboardCache",
					localStorageEnabled: true
				});
			}

		};

	}
]);


