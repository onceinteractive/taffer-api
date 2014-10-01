angular.module("taffer.app")
.config([
	"$stateProvider",
	function(stateProvider) {
		stateProvider.state("Login", {
			url: "/",
			templateUrl: "views/login/login.html",
			controller: "LoginCtrl"
		})

		.state("NeedApproval", {
			url: "/needapproval",
			templateUrl: "views/approval/view.html",
			controller: "ApprovalNeededCtrl"
		})

		.state("ForgotPassword", {
			url: "/reset_password",
			templateUrl: "views/login/reset_password.html",
			controller: "ResetPasswordCtrl"
		});
	}
]);
