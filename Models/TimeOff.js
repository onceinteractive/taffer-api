
module.exports = function(mongoose, models){

    var schema = mongoose.Schema({

        bar: {type: mongoose.Schema.Types.ObjectId, ref: 'Bar', index: true},

        requestor: {type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

        startTimeUTC: { type: Number, index: true },
        endTimeUTC: { type: Number, index: true },

        allDay: Boolean,

        approvalManager: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        approvalStatus: { type: String, index: true },
        approvalDate: Date,

        requestReason: String,
        declineReason: String,

        updated: { type: Date, default: Date.now },
        created: { type: Date, default: Date.now }

    });

    schema.methods.json = function(){
        var self = this
        return {
            id: self._id,
            bar:  self.bar,
            requestor: self.requestor,
            startTimeUTC: self.startTimeUTC,
            endTimeUTC: self.endTimeUTC,
            allDay: self.allDay,
            approvalManager: self.approvalManager,
            approvalStatus: self.approvalStatus,
            approvalDate: self.approvalDate,
            requestReason: self.requestReason,
            declineReason: self.declineReason,
            updated: self.updated,
            created: self.created
        }
    }

    return mongoose.model('TimeOff', schema)

}
