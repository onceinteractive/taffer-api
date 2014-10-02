module.exports = function(mongoose, model) {

    var schema = mongoose.Schema({

        dashboardImageSize: String,
        dashboardImage: String,
        bannerImage: String,
        
        title: String,
        description: String,

        url: String,

        states: [String],

        created: { type: Date, default: Date.now }
    });

    return mongoose.model('Ad', schema);
}
