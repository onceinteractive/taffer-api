angular.module("taffer.controllers")
.controller("ResetPasswordCtrl", [
    "$rootScope",
    "$scope",
	"$state",
	"api",
    "cordovaService",
    "DataService",
    "$ocModal",
	function(rootScope, scope, state, api, cordovaService, DataService, modal) {

		scope.afterImageLoad = function() {
	      scope.showForm = true;
	      scope.$apply();
	    };

	    scope.resetPassword = function() {
	    	if(scope.resetPasswordForm.$valid) {
	    		var resetPasswordPromise = api.post('users/resetPassword', { email: scope.email })

		    	resetPasswordPromise.success(function(data, status, headers, config) {
		    		modal.open({
							url: "views/modals/feedback_message.html",
							cls: "fade-in",
							init: {
								feedbackMessage: "Your password has been reset - we're e-mailing you a new password right now."
							}
						});
						state.go('Login');
		    	});

		    	resetPasswordPromise.error(function(data, status, headers, config) {
		    		console.log("Error: " + data)
		    		modal.open({
							url: "views/modals/error_message.html",
							cls: "fade-in",
							init: {
								errorMessage: 'Something went wrong resetting your password - please try again later.'
							}
						});
		    	});
		    } else {
		    	modal.open({
						url: "views/modals/error_message.html",
						cls: "fade-in",
						init: {
							errorMessage: "Please enter a valid email."
						}
					});
		    }
	    };

	    scope.back = function(){
	    	state.go('Login')
	    }

	    scope.iForgot = function() {
      if(event.which === 13) {
        scope.resetPassword();
      }
    }

	}
]);
