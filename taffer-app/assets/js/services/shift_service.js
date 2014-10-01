angular.module("taffer.services")
.factory("ShiftService", [
	"api", 
	"$q",
	"promiseCache",
	function(api, $q, promiseCache){
		return {
			getNextShifts: function() {
				return promiseCache({
					promise: function() {
						return api.get("shifts/nextShift").then(function(response) {
							return response.data;
						}, function(response) {
							return $q.reject(response.data);
						});
					},
					expireOnFailure: function() {
						return true;
					},
					ttl: 600000, // 10 minutes
					key: "nextShiftCache",
					localStorageEnabled: true
				});
			}

		};

	}
]);


