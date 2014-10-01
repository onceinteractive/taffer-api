angular.module("taffer.app")
.config([
	"$httpProvider",
	"$stateProvider",
	"$urlRouterProvider",
	"APIConfig",
	"apiProvider",
	function(http, stateRouter, urlRouter, CONFIG, api) {
		// Add Interceptors
		http.interceptors.push("spinnerInterceptor");
		http.interceptors.push("authInterceptor");

		// Create URL from config
		var API_BASE =
			CONFIG.protocol +
			"://" + CONFIG.host +
			":" + CONFIG.port +
			"/" + CONFIG.version + "/";

		// Set API base
		api.setBaseUrl(API_BASE);

		// Redirects and what not
		urlRouter.otherwise("/");			
	}
]);
