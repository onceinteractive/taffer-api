angular.module("taffer.controllers")
.controller("LogBookEntryCtrl", [
	"$scope",
	"$state",
	"$ocModal",
	"api",
	"KeenIO",
	function(scope, state, modal, api, keenIO) {

		scope.cancel = function() {
			state.go("Main.LogBook.List");
		};

		scope.removeImage = function() {
			if(scope.file && scope.newLogThread.imageKey) {
				scope.file = "";
				scope.newLogThread.imageKey = null;
			}
		};

		scope.save = function() {
			if(scope.logForm.$valid) {
				var postData = {
					title: scope.newLogThread.title,
					message: scope.newLogThread.message,
					priority: scope.newLogThread.priority
				}

				if(scope.file) {
					postData.image = scope.file;
				}

				var promise = api.post("logbook", postData);
				promise.success(function(data, status, headers, config) {
					scope.logs.unshift(data);
					scope.newLogThread.title = "";
					scope.newLogThread.message = "";
					scope.newLogThread.priority = "";
					scope.newLogThread.imageKey = null;

					keenIO.addEvent('logbookNew', {
						user: scope.auth.getUser()._id,
						bar: scope.auth.getUser().barId,
						title: scope.newLogThread.title.length,
						message: scope.newLogThread.message.length,
						priority: scope.newLogThread.priority,
						image: scope.file ? true : false
					})

					state.go("Main.LogBook.List");
				});

				promise.error(function(data, status, headers, config) {
					console.log(status);
					console.log(data);
				});
			} else {
				if(scope.logForm.entryTitle.$invalid) {
					feedback("The title field cannot be empty.");
				} else if(scope.logForm.logEntry.$invalid) {
					feedback("The log entry field cannot be empty.");
				} else {
					feedback("Something is wrong with the data you've entered...");
				}
			}
		};

		scope.imageSuccess = function(result) {
			scope.newLogThread.imageKey = result.uri;
			scope.$apply();
		};

		function feedback(errorMessage) {
      modal.open({
        url: "views/modals/error_message.html",
        cls: "fade-in",
        init: {
          errorMessage: errorMessage
        }
      });
    };

	}
]);
