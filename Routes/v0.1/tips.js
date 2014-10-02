var express = require('express')

module.exports = function(app, models){

	var tips = express.Router()

	tips.route('/')
		.get(app.auth, function(req, res){
			models.Bar.findOne({
				_id: req.user.barId
			}, function(err, bar){
				if(err || !bar){
					res.send(err, 500)
				} else {
					models.Tip.find({
						$or: [

							{ barCategory: 'All' },
							{ barCategories: bar.category },
							{ categories: bar.category }

						]
					}, function(err, tips){
						if(err){
							res.send(err, 500)
						} else {
							res.send(tips)
						}
					})
				}
			})

		})


	return tips

}
