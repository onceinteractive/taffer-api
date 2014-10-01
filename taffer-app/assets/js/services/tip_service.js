angular.module("taffer.services")
.factory("TipService", [
	"api", 
	"$q",
	"promiseCache",
	function(api, $q, promiseCache){
		return {
			getAll: function() {
				return promiseCache({
					promise: function() {
						return api.get("tips").then(function(response) {
							return response.data;
						}, function(response) {
							return $q.reject(response.data);
						});
					},
					expireOnFailure: function() {
						return true;
					},
					ttl: 28800000, // 8 hours
					key: "tipCache",
					localStorageEnabled: true
				});
				
			}
		};

	}
]);