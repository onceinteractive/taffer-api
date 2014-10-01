angular.module("taffer.controllers")
.controller("FacebookAccountsCtrl", [
	"$scope",
	"$init",
	"$ocModal",
	function(scope, init, modal) {
		scope.accounts = init.accounts.map(function(x) {
			return x.name;
		});


		scope.linkAccount = function() {
			console.log(scope.selectedAccount);
			if(scope.selectedAccount !== "default" && scope.selectedAccount !== "Select Account") {
				var id;
				init.accounts.map(function(x) {
					if(x.name === scope.selectedAccount) {
						id = x.id;
					}
				});

				init.linkAccount(id);
			}
		};

		scope.linkUser = function() {
			init.linkUser();
		};
	}
]);
