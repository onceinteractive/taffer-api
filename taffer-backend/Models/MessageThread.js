module.exports = function(mongoose, models){

    var schema = mongoose.Schema({
        barId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

        participants: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], index: true },

        messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],

        //Read status - all users whom have read the messages and the date they last read it.
        read: { type: { userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, time: Date }, defaultValue: {} },

        //Hidden status - all users whom have hidden the thread and when they did so.
        hidden: { type: { userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, time: Date }, defaultValue: {} },

    })

    schema.methods.json = function(excludeId, cb){
        var self = this

        if(!cb){
          cb = excludeId
          excludeId = null
        }

        var results = {
            _id: self._id,
            read: self.read,
            hidden: self.hidden,
            messages: [],
            participants: []
        }

        models.MessageThread.findOne({
          _id: self._id
        })
          .populate('participants')
          .exec(function(err, messageThread){
            if(err){
              cb(err)
              return
            }

            messageThread.participants.forEach(function(participant){
              if( (excludeId && excludeId.toString() != participant._id.toString()) || (!excludeId) ){
                  results.participants.push(participant.json())
              }
            })

            models.Message.find({
                threadId: self._id
            })
                .populate('from')
                .exec(function(err, messages){
                    if(err){
                        cb(err)
                        return
                    }

                    messages.forEach(function(message){
                        results.messages.push(message.json())
                    })

                    messages.sort(function(a, b){
                        if(a.sentOn > b.sentOn){
                            return 1
                        } else if(a.sentOn < b.sentOn){
                            return -1
                        } else {
                            return 0
                        }
                    })

                    cb(null, results)

                })

          })
    }

    return mongoose.model('MessageThread', schema)

}
