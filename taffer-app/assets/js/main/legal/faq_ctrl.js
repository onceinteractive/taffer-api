angular.module("taffer.controllers")
.controller("faqCtrl", [
	"$scope",
	function(scope) {
		scope.faq = {};
		scope.dropdown = {};
		scope.currentFAQ = "All";
		scope.showFAQ = {};

		//show/hide descriptions
		scope.showDesc = function(id) {
			if (scope.currentFAQ) {
				if (scope.faq[scope.currentFAQ][id].show) {
					scope.faq[scope.currentFAQ][id].show = false;
				}else{
					scope.faq[scope.currentFAQ][id].show=true;
				}
			}
		}


		//Clean names for the dropdown
		scope.dropdown = [
			{
				cleanName:"All",
				objName:"All"
			},
			{
				cleanName:"Courses",
				objName:"Courses"
			},
			{
				cleanName:"Log Book",
				objName:"LogBook"
			},
			{
				cleanName:"My Team",
				objName:"MyTeam"
			},
			{
				cleanName:"Partender",
				objName:"Partender"
			},
			{
				cleanName:"Profile",
				objName:"Profile"
			},
			{
				cleanName:"Q&A",
				objName:"QandA"
			},
			{
				cleanName:"Sales",
				objName:"Sales"
			},
			{
				cleanName:"Scheduler",
				objName:"Scheduler"
			}	
		];

		//json object of all faq items.
		scope.faq.Profile = [
			{
				title:"How do I see my Badges?",
				answer:"Your badges are available under your Profile, which can be accessed from the main dashboard."
			},
			{
				title:"How do I change my Profile Picture?",
				answer:"You can change your profile picture by navigating to your profile and tapping the existing photo or blank circle."
			},
			{
				title:"Where can I edit my address, email, phone, etc.?",
				answer:"Personal information can be edited under the Profile menu."
			},
			{
				title:"Where do I see my bar's Bar Code?",
				answer:"The Bar Code is visible under your Profile."
			},	
			{
				title:"Where can I edit my bar's information?",
				answer:"Information can be edited under the Profile menu."
			}
		];		


		scope.faq.Sales = [
			{
				title:"Why aren't my sales trends updating?",
				answer:"Ensure that all information has been properly submitted. If it has been, we may not have enough sales and customer data collected from you to display your trends quite yet!"
			}
		];	

		scope.faq.Scheduler = [
			{
				title:"How do I see my old/future schedules?",
				answer:"Under the Scheduler menu, simply press the arrows at the top of the screen to navigate from week to week."
			},
			{
				title:"How do I know if my schedule is published?",
				answer:"\"Published\" will appear in green under the Date of the selected schedule. "
			},
			{
				title:"How do I swap shifts with someone?",
				answer:"Press the "+" button on the Scheduler menu. Then, select your shift and select the employee you wish to trade with. After that, select which of their shifts you want to swap for then press submit."
			},
			{
				title:"How do I request time off?",
				answer:"Press the \"+\" button on the Scheduler menu.  Press \"Request Time Off\" and select the hours or days you wish to request."
			}
		];	


		scope.faq.MyTeam = [
			{
				title:"How do I remove an employee from my bar's network?",
				answer:"Go to \"My Team\", choose employee, and press \"deactivate\""
			},
			{
				title:"How do I change an employee's permissions?",
				answer:"Only an Admin may edit an employee's permissions. Navigate to \"My Team\", choose a team member, and press \"Set Permissions\"!"
			}
			];	

		scope.faq.LogBook = [
			{
				title:"Why can't my manager access the Logbook?",
				answer:"Check their permissions to ensure that they are a manager."
			},
			{
				title:"How do I mark a Logbook entry as URGENT?",
				answer:"Simply press the \"Urgent\" button when submitting a Logbook entry."
			}
		];


		scope.faq.Partender = [
			{
				title:"Why can't I see Partender?",
				answer:"Partender does not currently have an Android version of their application.  However, they are working on one!"
			}
		];


		scope.faq.Courses = [
			{
				title:"Why can't I access a course?",
				answer:"Ensure that you are subscribed to Taffer TV.  If you are, then the course may have been deactivated."
			},
			{
				title:"How do I share a course with an employee?",
				answer:"Simply choose the course, press the \"share\" button and choose which employees you wish to share the course with."
			}
		];

		scope.faq.QandA = [
			{
				title:"Does Jon really answer my questions submitted in the Q&A section?",
				answer:"Yes, of course!"
			}	
		];

		scope.faq.All = scope.faq.Courses.concat(scope.faq.LogBook).concat(scope.faq.MyTeam)
						.concat(scope.faq.Partender).concat(scope.faq.Profile).concat(scope.faq.QandA)
						.concat(scope.faq.Sales).concat(scope.faq.Scheduler);

	}
]);
