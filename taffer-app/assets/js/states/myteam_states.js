angular.module("taffer.app")
.config([
	"$stateProvider",
	function(stateProvider) {
		stateProvider.state("Main.MyTeam", {
			abstract: true,
			url: "/myteam",
			views: {
				"myteam": {
					template: '<div id="l-myteam" class="view" ui-view></div>',
					controller: "MyTeamCtrl",
					resolve: {
						MEMBERS: ["api", function(api) {
							return api.get("users/all");
						}],
						ROLES: ["api", function(api) {
							return api.get("roles");
						}],
						PERMISSIONS: ["api", function(api) {
							return api.get("permissions");
						}],
						APPROVALS: ["api", function(api) {
							return api.get("users/approvals");
						}]
					}
				}
			}
		})

		.state("Main.MyTeam.List", {
			url: "/myteamlist",
			templateUrl: "views/main/myteam/my_team_list.html",
			controller: "MyTeamListCtrl"
		})

		.state("Main.MyTeam.Profile", {
			url: "/myteamprofile?memberId",
			templateUrl: "views/main/myteam/my_team_profile.html",
			controller: "MyTeamProfileCtrl"
		})

		.state("Main.MyTeam.Permissions", {
			url: "/myteampermissions?memberId",
			templateUrl: "views/main/myteam/my_team_permissions.html",
			controller: "MyTeamPermissionsCtrl"
		})

		.state("Main.MyTeam.Invite", {
			url: "/myteaminvite",
			templateUrl: "views/main/myteam/my_team_invite.html",
			controller: "MyTeamInviteCtrl"
		})

		.state("Main.MyTeam.Contacts", {
			url: "/myteamcontacts",
			templateUrl: "views/main/myteam/my_team_contacts.html",
			controller: "MyTeamContactsCtrl"
		});
	}
]);
