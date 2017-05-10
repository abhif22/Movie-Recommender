var mongoose = require('mongoose')
var bcrypt = require('bcrypt')

var Schema = mongoose.Schema

var MovieSchema = new Schema({
	budget: String,
	genres: [{
				name: String,
				id: Number
			}
	],
	homepage: String,
	id: Number,
	imdb_id: String,
	original_language: String,
	original_title: String,
	overview: String,
	poster_path: String,
	release_date: Date,
	revenue: Number,
	runtime: Number,
	status: String,
	title: String,
	tagline: String,
	vote_average: Number,
	vote_count: Number,
	popularity: Number,
	belongs_to_collection: {
		poster_path: String,
		backdrop_path: String,
		name: String
	}
})

var Movie = mongoose.model('Movie', MovieSchema)

module.exports = Movie