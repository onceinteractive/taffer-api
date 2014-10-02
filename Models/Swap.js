/**
 * User: mikeroth
 * Date: 7/24/14
 * Time: 4:18 PM
 */

module.exports = function(mongoose, models){

    var schema = mongoose.Schema({
        bar: {type: mongoose.Schema.Types.ObjectId, ref: 'Bar', index: true},

        requestor: {type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
        switchWith: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},

        originalShift: {type: mongoose.Schema.Types.ObjectId, ref: 'Shift'},
        requestedShift: {type: mongoose.Schema.Types.ObjectId, ref: 'Shift'},

        switchWithStatus: { type: String, index: true },

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
        var result = {
            id: self._id,
            bar: self.bar,
            requestor: self.requestor,
            switchWith: self.switchWith,
            originalShift: self.originalShift,
            requestedShift: self.requestedShift,
            switchWithStatus: self.switchWithStatus,
            approvalManager: self.approvalManager,
            approvalStatus: self.approvalStatus,
            approvalDate: self.approvalDate,
            requestReason: self.requestReason,
            declineReason: self.declineReason,
            updated: self.updated,
            created: self.created
        }

        if(result.bar.json){
            result.bar = result.bar.json()
        }

        if(result.requestor.json){
            result.requestor = result.requestor.json()
        }
        if(result.switchWith.json){
            result.switchWith = result.switchWith.json()
        }
        if(result.approvalManager && result.approvalManager.json){
            result.approvalManager = result.approvalManager.json()
        }

        if(result.originalShift.json){
            result.originalShift = result.originalShift.json()
        }
        if(result.requestedShift.json){
            result.requestShift = result.requestedShift.json()
        }

        return result
    }

    return mongoose.model('Swap', schema)

}
