angular.module("taffer.services")
.factory("TooltipService", [
	"$state",
	"STEPS",
	"api",
	"AuthService",
	function(state, steps, api, auth) {
		return {
			showTooltips: function() {
				// console.log("HERE")
				var user = auth.getUser()

				var isAdmin = false;
				if(user.role == "owner" || user.role == "manager") {
					isAdmin = true;
				}

				var showIntro = true;
				var intro = introJs();
				switch(state.current.name) {
					case "Main.Messages.List":
						if(auth.hasPermission('messages', 'sendToAll')) intro.setOptions(steps.messages.owner.list);
						else intro.setOptions(steps.messages.staff.list);
						break;
					case "Main.Sales.View":
						intro.setOptions(steps.sales.view);
						break;
					case "Main.Sales.Edit":
						intro.setOptions(steps.sales.edit);
						break;
					case "Main.Sales.Trends":
						intro.setOptions(steps.sales.trends);
						break;
					case "Main.Preshift.List":
						if(auth.hasPermission('preshift', 'view')) intro.setOptions(steps.preshift.view.manager)
						else intro.setOptions(steps.preshift.view.staff)
						break;
					case "Main.Preshift.New":
						if(auth.hasPermission('preshift', 'send')) intro.setOptions(steps.preshift.edit.manager)
						break;
					case "Main.Schedule.Overview":
						if(auth.hasPermission('schedule', 'approveTimeOff')) intro.setOptions(steps.scheduler.overview.manager)
						else intro.setOptions(steps.scheduler.overview.staff)
						break;
					case "Main.Schedule.ShiftSwap":
						if(auth.hasPermission('schedule', 'approveTimeOff')) intro.setOptions(steps.scheduler.requests.manager)
						else intro.setOptions(steps.scheduler.requests.staff)
						break;
					case "Main.MyTeam.List":
						if(auth.hasPermission('users', 'permissions')) intro.setOptions(steps.myTeam.manager)
						else intro.setOptions(steps.myTeam.staff)
						break;
					case "Main.Promotions.Scheduled":
						if(auth.hasPermission('promotions', 'create')) intro.setOptions(steps.promotions.scheduled.manager)
						break;
					case "Main.Promotions.List":
						if(auth.hasPermission('promotions', 'create')) intro.setOptions(steps.promotions.list.manager)
						break;
					case "Main.Promotions.New":
						if(auth.hasPermission('promotions', 'create')) intro.setOptions(steps.promotions.create.manager)
						break;	
					case "Main.Promotions.Social":
						if(auth.hasPermission('promotions', 'create')) intro.setOptions(steps.promotions.social.manager)
						break;	
					case "Main.LogBook.List":
						intro.setOptions(steps.logbook);
						break;
					case "Main.Courses.List":
						if(auth.hasPermission('courses', 'viewAll')) intro.setOptions(steps.courses.manager)
						else intro.setOptions(steps.courses.staff)
						break;
					case "Main.Questions":
						intro.setOptions(steps.qa.main);
						break;
					case "Main.Questions.NewQuestion":
						intro.setOptions(steps.qa.create);
						break;
					case "Main.Profile":
						if(auth.hasPermission('bars', 'edit')) intro.setOptions(steps.profile.manager)
						else intro.setOptions(steps.profile.staff)
						break;
					default:
						console.log("state name not matched");
						showIntro = false;
				}

				if(showIntro && user.tipsTriggered.indexOf(state.current.name) == -1){
					// console.log("HERE SHOWING TUTORIAL")
					intro.start();
					//TODO - locally  save the triggering on the user object so that you don't need to reload the user
					// and so you don't constantly restart the tutorial.

					var refreshedUser = auth.getUser()
					refreshedUser.tipsTriggered.push(state.current.name)
					auth.setUser(refreshedUser)

					var promise = api.post("users/tips", { triggered: state.current.name });
					promise.success(function(data, status, headers, config) {
						console.log("Saved " + state.current.name + " as triggered")
					});

					promise.error(function(data, status, headers, config) {
						console.log("Problem saving " + state.current.name + " as triggered")
						console.log(status);
						console.log(data);
					});
				}
			}
		}
	}
]);
