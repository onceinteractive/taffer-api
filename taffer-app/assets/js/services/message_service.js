angular.module("taffer.services")
.factory("MessageService", [
	"api", 
	"$q",
	"$rootScope",
	"spinner",
	"promiseCache",
	function(api, $q, rootScope, spinner, promiseCache){
		return {
			saveMessage: function(message) {
				return api.post("messages", message)
					.then(function(response) {
						return response.data;
					}, function(response) {
						return $q.reject(response.data);
					});
			},

			updateMessage: function(message, messageId) {
				spinner.override();
				return api.post("messages/" + messageId, message)
					.then(function(response) {
						return response.data;
					}, function(response) {
						return $q.reject(response.data);
					});
			},

			getMessages: function(noCache) {
				spinner.override();
				return api.get("messages")
					.then(function(response) {
						if(response.data && !noCache) {
							localStorage.setItem("messagesCache", JSON.stringify(response.data));
							rootScope.$broadcast("messages-cache:updated");
						}
						return response.data;
					}, function(response) {
						return $q.reject(response.data);
				});
			},

			getMessagesFromCache: function() {
				var messages = localStorage.getItem("messagesCache");
				if(messages && messages !== "") {
					try {
						var parsed = JSON.parse(messages);
						return parsed.reverse();	
					} catch (e) {
						console.log(e);
						return [];
					}
				} else {
					return [];
				}
			},

			getMessageById: function(messageThreadId) {
				spinner.override();
				return api.get("messages/" + messageThreadId)
					.then(function(response) {
						return response.data;
					}, function(response) {
						return $q.reject(response.data);
					});
			},

			getMessageRecipients: function() {
				return promiseCache({
					promise: function() {
						return api.get("messages/whocanimessage")
						.then(function(response) {
							return response.data;
						}, function(response) {
							return $q.reject(response.data);
						});
					},
					expireOnFailure: function() {
						return true;
					},
					ttl: 300000, // 5 minutes
					key: "messageRecipientsCache",
					localStorageEnabled: true
				});
			},

			delete: function(messageId) {
				spinner.override();
				return api.post("messages/" + messageId + "/hidden")
					.then(function(response) {
						return response.data;
					}, function(response) {
						return $q.reject(response.data);
				});
			}
		};

	}
]);

