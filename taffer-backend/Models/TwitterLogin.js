module.exports = function(mongoose, models){

    var schema = mongoose.Schema({
        requestToken: { type: String, index: true },
        requestTokenSecret: String,

        created: { type: Date, default: Date.now }

    })

    return mongoose.model('TwitterLogin', schema)

}
