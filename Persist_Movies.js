	// RUN : mongoimport --db movie-recommender --collection movies --file /media/abhishek/AC9A1D089A1CD126/4th\ Year\ Project/Temp\ Backend/Movie_Details_Upto_2016.json



	var fs = require('fs')
	var mongoose = require('mongoose');
	var Movie = require('./models/movie.js')

	movieDetails = fs.readFileSync('movieDetails16Sorted.json', {encoding: 'utf8'})
	movies = JSON.parse(movieDetails)
	mongoose.connect('mongodb://localhost/movie-recommender',(err)=>{
        if(err){
            console.log('Connection to MongoDB Failed!')
            console.log(err)
          }
          else{
            console.log('Connection to MongoDB Successfull!')
          }
    })

    var db = mongoose.connection


/*	var moviesArray = [];
	for(key in movies){
		// console.log(movies[key])
		var a = []
		json = JSON.parse(JSON.stringify(movies[key].belongs_to_collection).split('"backdrop_path":').join('"collection_backdrop_path":'));
		// document.write(JSON.stringify(json));
		movies[key].belongs_to_collection = JSON.stringify(json);
		movies[key].id = Math.round(movies[key].id)
		a.push(movies[key])
		moviesArray.push(a)
	}*/
// // console.log(moviesArray[145])
// var tmp = JSON.stringify({movies: moviesArray},null, 4)
// // console.log(tmp)
// fs.writeFileSync('./puremoviesdata.json',tmp)
	// console.log(movies[1])

	// console.log(movies[1])

	// Generate the Schema object.
	// var MovieSchema = new mongoose.Schema(generator.convert(movies));
	// console.log("MOVIE SCHEMA")
	// console.log(MovieSchema)
	// var Movie = mongoose.model('Movie',MovieSchema)
	// module.exports = Movie
	var i=0;
	process.nextTick(()=>{
		for(key in movies){
		// console.log(movies[key])
		process.nextTick(()=>{
		var newMovie = new Movie({
			budget: movies[key].budget,
			genres: movies[key].genres,
			homepage: movies[key].homepage,
			id: Math.round(movies[key].id),
			imdb_id: movies[key].imdb_id,
			original_language: movies[key].original_language,
			original_title: movies[key].original_title,
			overview: movies[key].overview,
			poster_path: movies[key].poster_path,
			release_date: movies[key].release_date,
			revenue: movies[key].revenue,
			runtime: movies[key].runtime,
			status: movies[key].status,
			title: movies[key].title,
			tagline: movies[key].tagline,
			vote_average: movies[key].vote_average,
			vote_count: movies[key].vote_count,
			popularity: movies[key].popularity,
			belongs_to_collection: movies[key].belongs_to_collection
			})
			newMovie.save((err)=>{
				if(err)
			console.log('Movie with ID: '+movies[key].id+'could not be saved')
			})
			i++;
		})
	}
		console.log('Saved Total: '+i)
	})


//Find Using db.movies.findOne({'id':410803})
