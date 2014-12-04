module.exports = function(mongoose, model) {

    var schema = mongoose.Schema({

        title: String,
        description: String,

        videoLink: String,
        previewImageKey: String,

        type: String,

        quiz: [{
        	question: String,
        	correctAnswer: String,
        	reason: String,
        	wrongAnswers: [String]
        }],

        badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge', default: [] }],
        badgeImage: String,

        published: { type: Boolean, default: false },
        publishedStartDate: Date,
        publishedEndDate: Date,

        barCategories: { type: [String], default: 'All' },

        updated: { type: Date, default: Date.now },
		created: { type: Date, default: Date.now }
    })

    schema.methods.json = function(user){
    	var self = this

    	var result = {
        _id: self._id,
    		title: self.title,
    		description: self.description,
    		videoLink: self.videoLink,
        previewImageKey: self.previewImageKey,
            badgeImage: self.badgeImage,
        quiz: self.quiz,
    		badges: []
    	}

    	if(self.badges
    		&& self.badges.length > 0
    		&& self.badges[0].json){
    		self.badges.forEach(function(badge){
    			result.badges.push(badge.json(user))
    		})
    	}

    	if(user){
    		result.complete = false
    		if(user.completedCourses && user.completedCourses.length > 0){
    			user.completedCourses.forEach(function(courseId){
    				if(self._id.toString() == courseId.toString()){
    					result.complete = true
    				}
    			})
    		}

            result.viewed = false
            if(user.viewedCourses && user.viewedCourses.length >0){
                user.viewedCourses.forEach(function(courseId){
                    if(self._id.toString() == courseId.toString()){
                        result.viewed = true
                    }
                })
            }
    	}

    	return result
    }

    return mongoose.model('Course', schema)
}
