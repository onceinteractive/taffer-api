angular.module("taffer.services")
.factory("SponsorService", [
	"api", 
	"$q",
	"promiseCache",
	function(api, $q, promiseCache){
		return {
			get: function() {
				return promiseCache({
					promise: function() {
						return api.get("ads").then(function(response) {
							return response.data;
						}, function(response) {
							return $q.reject(response.data);
						});
					},
					expireOnFailure: function() {
						return true;
					},
					ttl: 180000,
					key: "sponsoredContentCache",
					localStorageEnabled: true
				});
			}

		};

	}
]);