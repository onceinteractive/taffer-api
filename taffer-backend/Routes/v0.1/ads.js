var express = require('express')

module.exports = function(app, models){

    var ads = express.Router()

    ads.route('/')
        //Get my ads
        .get(app.auth, function(req, res){
            models.Bar.findOne({
                _id: req.user.barId
            }, function(err, bar){
                if(err || !bar){
                    res.send([])
                } else {
                    models.Ad.find({
                        states: bar.state
                    }, function(err, ads){
                        if(err || !ads){
                            res.send([])
                        } else {
                            var large = []
                            var small = []
                            ads.forEach(function(ad){
                                if(ad.dashboardImageSize == 'large'){
                                    large.push(ad)
                                } else {
                                    small.push(ad)
                                }
                            })

                            var shuffle = function(array) {
                                var counter = array.length, temp, index

                                // While there are elements in the array
                                while (counter > 0) {
                                    // Pick a random index
                                    index = Math.floor(Math.random() * counter)

                                    // Decrease counter by 1
                                    counter--

                                    // And swap the last element with it
                                    temp = array[counter]
                                    array[counter] = array[index]
                                    array[index] = temp
                                }

                                return array
                            }

                            large = shuffle(large)
                            small = shuffle(small)

                            var result = {}

                            result.large = large.pop()
                            result.small = [small.pop(), small.pop()]

                            res.send(result)

                        }
                    })
                }
            })

        })

    ads.route('/:adId')
        .get(app.auth, function(req, res){
            models.Ad.findOne({
                _id: models.ObjectId(req.params.adId)
            }, function(err, ad){
                if(err){
                    res.send(err, 500)
                } else if(!ad){
                    res.send(404)
                } else {
                    res.send(ad)
                }
            })
        })


    return ads

}
