module.exports = function(mongoose, models){

    var schema = mongoose.Schema({

        shareableId: {type: mongoose.Schema.Types.ObjectId, ref: 'Shareable' },

		network: [String], //facebook,facebookPage, twitter
		postOn: Date,
		taskId: { type: mongoose.Schema.Types.ObjectId, index: true },

		generalPostError: String,

		facebookPostId: String,
		facebookPostError: String,

		twitterPostId: String,
		twitterPostError: String,

        updated: { type: Date, default: Date.now },
        created: { type: Date, default: Date.now }
    })

    return mongoose.model('ScheduledPost', schema)

}
