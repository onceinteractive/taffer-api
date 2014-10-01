/**
 * Re-created by kchester on 09/02/14.
 */
module.exports = function(mongoose, models){

    var schema = mongoose.Schema({

        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        scheduler: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        bar: {type: mongoose.Schema.Types.ObjectId, ref: 'Bar'},

        startTimeUTC: { type: Number, index: true },
        endTimeUTC: { type: Number, index: true },

        isOpening: Boolean,
        isClosing: Boolean,

        published: Boolean,

        updated: { type: Date, default: Date.now },
        created: { type: Date, default: Date.now }
    });

    schema.methods.json = function(){
        var self = this
        var result = {
            _id: self._id,
            bar: self.bar,
            scheduler: self.scheduler,
            user: self.user,
            startTimeUTC: self.startTimeUTC,
            endTimeUTC: self.endTimeUTC,
            isOpening: self.isOpening,
            isClosing: self.isClosing,
            published: self.published,
            updated: self.updated,
            created: self.created
        }

        if(result.bar.json){
            result.bar = result.bar.json()
        }

        if(result.user.json){
            result.user = result.user.json()
        }

        if(result.scheduler.json){
            result.scheduler = result.scheduler.json()
        }

        return result
    }

    return mongoose.model('Shift', schema)

}
