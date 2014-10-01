var appUtilities = angular.module('appUtilities', []);

appUtilities.factory('utility', function(){
	
	var utility = {};

	// accepts an object of type { "String" : boolean }
	utility.objectToArray = function(object){
		var array = [];
		angular.forEach(object, function(value, key){
			if (value === true) {
				array.push(key);
			}
		});
		return array;
	}

	// accepts an array of strings and checks it's content against a modelArray of strings (that contains all possible strings).
	// outputs an object of type { "String" : boolean } where boolean represents whether or not that string was in array.
	utility.arrayToObject = function(array, modelArray) {
		var object = {};
		modelArray.forEach(function(item){
			if(array.indexOf(item) !== -1) {
				object[item] = true;
			} else {
				object[item] = false;
			}
		});
		return object;
	}

	// accepts an array of strings and a boolean.
	// outputs an object of type { "String" : boolean }
	utility.loadObjFromArray = function(array, bool){
		var object = {};
		array.forEach(function(item){
			object[item] = bool;
		});
		return object;
	}

	// utility.imagePrefix = "https://s3.amazonaws.com/taffer-dev/";

	utility.displayWithPrefix = function(imageKey){
		if (imageKey){
			return "https://s3.amazonaws.com/taffer-dev/" + imageKey;
		} else {
			return "";
		}
	}

	return utility;
});