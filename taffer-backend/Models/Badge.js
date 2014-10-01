module.exports = function(mongoose, model) {

    var schema = mongoose.Schema({

        title: String,
        description: String,

        imageKey: String,

        completeOn: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: [] }],

        updated: { type: Date, default: Date.now },
        created: { type: Date, default: Date.now }
    })

    //Returns boolean of whether user has badge
    schema.methods.isComplete = function(user){
        var self = this
        if(!self.completeOn || self.completeOn.length == 0){
            return false
        }

        //Return true if user already completed it
        if(user.badges){
            var alreadyCompleted
            user.badges.forEach(function(badge){
                if(badge.toString() == self._id.toString()){
                    alreadyCompleted = true
                }
            })
            if(alreadyCompleted){
                return true
            }
        }

        //Check to see if the user has completed all of the courses
        var incomplete = self.completeOn.length
        self.completeOn.forEach(function(requiredCourseId){
            user.completedCourses.forEach(function(completedCourseId){
                if(requiredCourseId.toString() == completedCourseId.toString()){
                    incomplete--
                }
            })
        })

        if(incomplete <= 0){
            return true
        } else {
            return false
        }

    }

    schema.methods.json = function(user){
    	var self = this

    	var result = {
            title: self.title,
            description: self.description,
            imageKey: self.imageKey
    	}

    	if(user){
    		var isCompleted
    		if(user.badges){
    			user.badges.forEach(function(badgeId){
    				if(self._id.toString() == badgeId.toString()){
    					isCompleted = true
    				}
    			})
    		}

    		if(isCompleted){
    			result.complete = true
    		} else {
                result.complete = false
            }
    	}

        if(self.completeOn
            && self.completeOn.length > 0
            && self.completeOn[0].json){
            result.earnedFrom = []

            self.completeOn.forEach(function(course){
                result.earnedFrom.push(course.json())
            })
        }

    	return result
    }

    return mongoose.model('Badge', schema)
}
