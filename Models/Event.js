
/**
 * Re-created by kchester on 09/02/14.
 */
module.exports = function(mongoose, models){

    var schema = mongoose.Schema({

        title: String,
        description: String,

        scheduler: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        bar: {type: mongoose.Schema.Types.ObjectId, ref: 'Bar'},

        extendsSeries: {type: String, index: true},

        date: String,

        startTimeUTC: { type: Number, index: true },
        endTimeUTC: { type: Number, index: true },

        isOpening: Boolean,
        isClosing: Boolean,
        isAllDay: Boolean,

        updated: { type: Date, default: Date.now },
        created: { type: Date, default: Date.now }
    })

    schema.methods.json = function(){
        var self = this
        var result = {
            _id: self._id,
            bar: self.bar,
            extendsSeries: self.extendsSeries,
            date: self.date,
            title: self.title,
            description: self.description,
            scheduler: self.scheduler,
            startTimeUTC: self.startTimeUTC,
            endTimeUTC: self.endTimeUTC,
            isOpening: self.isOpening,
            isClosing: self.isClosing,
            updated: self.updated,
            created: self.created
        }

        if(result.bar.json){
            result.bar = result.bar.json()
        }

        if(result.scheduler.json){
            result.scheduler = result.scheduler.json()
        }

        return result
    }

    return mongoose.model('Event', schema)

}
