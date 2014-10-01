angular.module("taffer.app")
.config([
	"$stateProvider",
	function(stateProvider) {
		stateProvider.state("Registration", {
			url: "/register",
			abstract: true,
			templateUrl: "views/register/register_parent.html",
			controller: "RegisterParentCtrl"
		})

		// Common Registration States
		.state("Registration.BasicInfo", {
			url: "/step1?email&password&novideo",
			templateUrl: "views/register/register_basic.html",
			controller: "RegisterBasicInfoCtrl"
		})

		.state("Registration.BarID", {
			url: "/step2?resuming",
			templateUrl: "views/register/register_bar_id.html",
			controller: "RegisterBarIDCtrl"
		})

		// Admin Path States
		.state("Registration.BarInfo", {
			url: "/admin-step3",
			templateUrl: "views/register/admin/register_bar_info.html",
			controller: "RegisterBarInfoCtrl",
			resolve: {
				CATEGORIES: ["api", function(api) {
					return api.get("bar/types");
				}],
				BAR: ["api", function(api){
						return api.get("bar").then(function(data){
							console.log("SUCCESS FUNCTION")
							console.log(data)
							return data.data
						},
						function(data){
							console.log("ERROR FUNCTION")
							console.log(data)
							return null
						})
					}
				]
			}
		})

		.state("Registration.QuestionsIntro", {
			url: "/questions-intro",
			templateUrl: "views/register/admin/questions_intro.html",
			controller: "RegisterQuestionsIntroCtrl",
		})

		.state("Registration.BarQuestions", {
			url: "/admin-step4",
			templateUrl: "views/register/admin/register_bar_questions.html",
			controller: "RegisterBarQuestionsCtrl",
			resolve: {
				questions: ["api", function(api) {
					return api.get("surveys");
				}]
			}

		})

		.state("Registration.AdminProfile", {
			url: "/admin-step5?resuming",
			templateUrl: "views/register/admin/register_complete_profile.html",
			controller: "RegisterAdminProfileCtrl"
		})

		// Team Member Path States
		.state("Registration.TMProfile", {
			url: "/tm-step3?resuming",
			templateUrl: "views/register/tm/register_complete_profile.html",
			controller: "RegisterTMProfileCtrl"
		});
	}
]);
