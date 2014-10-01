angular.module("taffer.app")
.config([
	"$stateProvider",
	function(stateProvider) {
		stateProvider.state("Main.Legal", {
			abstract: true,
			url: "/legal",
			views: {
				"courses": {
					template: '<div id="l-legal-view" class="view" ui-view></div>'
				}
			}
		})

		.state("Main.Legal.FAQ", {
			url: "/faq",
			templateUrl: "views/main/legal/faq.html",
			controller: "faqCtrl",
			onEnter: function() {
				(function() {
		      window.scrollTo(0,0);
		    })();
			}
		})

		.state("Main.Legal.TermsOfUse", {
			url: "/termsofuse",
			templateUrl: "views/main/legal/terms_of_use.html",
			onEnter: function() {
				(function() {
		      window.scrollTo(0,0);
		    })();
			}
		})

		.state("Main.Legal.PrivacyPolicy", {
			url: "/privacypolicy",
			templateUrl: "views/main/legal/privacy_policy.html",
			onEnter: function() {
				(function() {
		      window.scrollTo(0,0);
		    })();
			}
		});
	}
]);
