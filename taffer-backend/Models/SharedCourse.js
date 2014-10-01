module.exports = function(mongoose, model) {

    var schema = mongoose.Schema({

        barId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bar' },

        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },

        from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        to: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],

        message: String,

        updated: { type: Date, default: Date.now },
		created: { type: Date, default: Date.now }
    })

    return mongoose.model('SharedCourse', schema)
}
