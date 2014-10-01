angular.module("taffer.controllers")
.controller("LoginCtrl", [
    "$rootScope",
    "$scope",
	"$state",
	"api",
    "cordovaService",
    "DataService",
    "$ocModal",
    "SocialService",
    "AuthService",
    "KeenIO",
	function(rootScope, scope, state, api, cordovaService, DataService, modal, socialService, auth, keenIO) {
		scope.user = {};
		scope.message = "";
        scope.showForm = false;
        scope.isLogin = true;
        scope.showLoginPage = false;

        auth.isLoggedIn().then(function(result) {
            if(result) {
                rootScope.$broadcast("auth:no-login-required");
                checkRegistrationStatus();
            } else {
                scope.showLoginPage = true;
            }
        });

	scope.resetPassword = function() {
		state.go('ForgotPassword')
	}

    scope.afterImageLoad = function() {
      scope.showForm = true;
      scope.$apply();
    };

    scope.submitLogin = function() {
      if(event.which === 13) {
        scope.login();
      }
    };

		// Handle Login
		scope.login = function() {
			if(scope.loginForm.$valid) {
                auth.login(scope.user.email, scope.user.password)
                    .then(function(result) {
                        scope.saveDeviceData();
                        checkRegistrationStatus();
                    }).catch(function(err) {
                    	if(err == 'noConnection' ||
                    		(err.data == '' && err.status == 0)){
                    		showModal("I'm sorry, but there's an issue with your network.")
                    	} else {
                    		showModal("Invalid email or password.")
                    	}
                    });
			} else {
				if(scope.loginForm.loginEmail.$invalid) {
					showModal("Invalid email.", function() {
						scope.user.email = null;
						scope.user.password = null;
						scope.$apply();	
					});
					return;
				}

				if(scope.loginForm.loginPassword.$invalid) {
					showModal("Password must be at least eight characters, contain one uppercase letter, and contain one number.", function() {
						scope.user.password = null;
						scope.$apply();	
					});
					return;
				}
			}
		};


		function showModal(errorMessage, onCloseFn) {
			modal.open({
				url: "views/modals/error_message.html",
				cls: "fade-in",
				init: {
					errorMessage: errorMessage
				},
				onClose: onCloseFn
			});
		};

		// Social Logins
		scope.facebook = function() {
			socialService.loginFacebook(
				function(data, status, headers, config){
					rootScope.$broadcast("auth:no-login-required");
                    if(status == 200) {
                        localStorage.setItem("taffer_token", JSON.stringify(data));
                        auth.setUser(data);
                        checkRegistrationStatus();

                        keenIO.addEvent('facebookLogin', {
			              user: auth.getUser()._id,
			              bar: auth.getUser().barId,
			              result: 'success'
			            })
                    } else {
                    	keenIO.addEvent('facebookLogin', {
			              user: auth.getUser()._id,
			              bar: auth.getUser().barId,
			              result: 'error',
			              error: data
			            })
                    }
				},
				function(){
					//Nothing to do on failure as modals are already handled
				}
			)
		};

		scope.twitter = function() {
			socialService.loginTwitter(
				function(data, status, headers, config){
					rootScope.$broadcast("auth:no-login-required");
                    if(status == 200) {
                    	localStorage.setItem("taffer_token", JSON.stringify(data));
                        auth.setUser(data);
                        checkRegistrationStatus();

                        keenIO.addEvent('twitterLogin', {
			              user: auth.getUser()._id,
			              bar: auth.getUser().barId,
			              result: 'success'
			            })
                    } else {
                    	keenIO.addEvent('twitterLogin', {
			              user: auth.getUser()._id,
			              bar: auth.getUser().barId,
			              result: 'error',
			              error: data
			            })
                    }
				},
				function(){
					//Nothing to do on failure as modals are already handled
				}
			)
		};

		// Handle Register
		scope.register = function() {
			if(scope.user.email && scope.user.password) {
				scope.isLogin = false;
				state.go("Registration.BasicInfo", {
					email: scope.user.email,
					password: scope.user.password
				});
			} else {
				scope.isLogin = false;
				state.go("Registration.BasicInfo");
			}
		};

		// Helper Functions
		function checkRegistrationStatus() {
			var user = auth.getUser();
            if(user.status === "deactivated") {
                showModal("Sorry, but you have been deactivated.  Please contact your bar owner if you believe this message to be in error");
            }

            if(user.status == 'registering' && !user.barId){
            	scope.isLogin = false
            	state.go('Registration.BarID')
            	return
            }

            if(user.status == 'registering' && user.permissions && user.permissions.bars && user.permissions.bars.edit){
            	scope.isLogin = false
            	state.go("Registration.BarInfo")
            	return
            }

			if(user.status !== "approvalRequired") {
				scope.$emit("login:success");
				scope.isLogin = false;
				state.go("Main.Landing");
				return;
			}

            if(user.status === "approvalRequired") {
            	scope.isLogin = false;
                state.go("NeedApproval");
                return;
            }
		};
	}
]);
