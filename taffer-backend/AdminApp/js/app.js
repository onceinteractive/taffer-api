var myApp = angular.module('myApp', [
  'ngRoute',
  'appControllers',
  'CustomFilter',
  'appDirectives',
  'appUtilities'
]);

angular.module('appControllers', []);
 
angular.module('CustomFilter', []).
  filter('capitalize', function() {
    return function(input, all) {
      return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    }
  });


 //do routes
myApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/main', {
        templateUrl: 'partials/main.html',
        controller: 'ctrlMain'
      }).
      when('/login', {
        templateUrl: 'partials/login.html',
        controller: 'ctrlLogin'
      }).
      when('/search', {
        templateUrl: 'partials/search.html',
        controller: 'ctrlSearch'
      }). 
      when('/viewUser/:userID', {
        templateUrl: 'partials/users/view.html',
        controller: 'viewUser'
      }). 
      when('/viewBar/:barID', {
        templateUrl: 'partials/bars/view.html',
        controller: 'viewBar'
      }).
        when('/createAdmin', {
        templateUrl: 'partials/admin/create.html',
        controller: 'createAdmin'
      }).     
      when('/viewAdmin/:adminID', {
        templateUrl: 'partials/admin/view.html',
        controller: 'viewAdmin'
      }).  
      when('/viewAdmins', {
          templateUrl: 'partials/admin/viewAll.html',
          controller: 'allAdmins'
      }).       
        when('/viewTips', {
          templateUrl: 'partials/tips/view.html',
          controller: 'viewTips'
      }).
        when('/createTip', {
          templateUrl: 'partials/tips/create.html',
          controller: 'createTip'
      }).
        when('/updateTip/:tipID', {
          templateUrl: 'partials/tips/update.html',
          controller: 'updateTip'
      }).
        when('/createAd', {
          templateUrl: 'partials/ads/create.html',
          controller: 'viewAndCreateAdCtrl'
      }).
        when('/viewAds', {
          templateUrl: 'partials/ads/view.html',
          controller: 'viewAndCreateAdCtrl'
      }).
        when('/updateAd/:adID', {
          templateUrl: 'partials/ads/update.html',
          controller: 'updateAd'
      }).
        when('/viewPromotions', {
          templateUrl: 'partials/promotions/view.html',
          controller: 'promotionsCtrl'
      }).
        when('/createPromotion', {
          templateUrl: 'partials/promotions/create.html',
          controller: 'promotionsCtrl'
      }).
        when('/createCourse', {
          templateUrl: 'partials/courses/create.html',
          controller: 'createCourse'
      }).
        when('/viewCourses', {
          templateUrl: 'partials/courses/view.html',
          controller: 'viewCourses'
      }).
        when('/viewQuestions', {
          templateUrl: 'partials/questions/view.html',
          controller: 'viewQuestions'
      }).
        when('/createQuestion', {
          templateUrl: 'partials/questions/create.html',
          controller: 'createQuestion'
      }).
        otherwise({
          redirectTo: '/search'
      });
  }]);