angular.module("taffer.services")
.factory("SuggestionService", [
	"api", 
	"$q",
	"$rootScope",
	"spinner",
	"promiseCache",
	function(api, $q, rootScope, spinner, promiseCache){
		return {
			saveSuggestion: function(suggestion) {
				return api.post("suggestions", suggestion)
					.then(function(response) {
						return response.data;
					}, function(response) {
						return $q.reject(response.data);
					});
			},

			getSuggestions: function(invalidateCache) {
				if(invalidateCache) {
					promiseCache.remove("suggestionsCache", false);
				}

				return promiseCache({
					promise: function() {
						return api.get("suggestions")
						.then(function(response) {
							return response.data;
						}, function(response) {
							return $q.reject(response.data);
						});
					},
					expireOnFailure: function() {
						return true;
					},
					ttl: 1800000, // 30 minutes
					key: "suggestionsCache",
					localStorageEnabled: true
				});
			},

			getById: function(suggestionId) {
				return api.get("suggestions/" + suggestionId)
					.then(function(response) {
						return response.data;
					}, function(error) {
						return $q.reject(response.data);
					});
			},

			delete: function(suggestionId) {
				spinner.override();
				return api.delete("suggestions/" + suggestionId)
					.then(function(response) {
						return response.data;
					}, function(response) {
						return $q.reject(response.data);
				});
			}
		};

	}
]);

