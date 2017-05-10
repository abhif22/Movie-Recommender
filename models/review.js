var mongoose = require('mongoose')
var bcrypt = require('bcrypt')

var Schema = mongoose.Schema

var ReviewSchema = new Schema({
	key: Number,
	id: Number,
	review_collection: [
		{
			review: String
		}
	]
})

var Review = mongoose.model('Review', ReviewSchema)

module.exports = Review