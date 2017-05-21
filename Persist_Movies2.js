	// RUN : mongoimport --db movie-recommender --collection movies --file /media/abhishek/AC9A1D089A1CD126/4th\ Year\ Project/Temp\ Backend/Movie_Details_Upto_2016.json

	//NOT USING TILL THIS COMMIT

	var fs = require('fs')
	var mongoose = require('mongoose');
	var Movie = require('./models/movie.js')
	var async = require('async')
	var http = require('http')

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
	var i=0;


//STARTING WATERFALL

	async.waterfall([(callback)=>{
		var arr = []
		for(key in movies){
			arr.push(movies[key])
		}
		callback(null, arr)
	},(moviesArr, callback)=>{
		var newCastList = []
		//Loop for each movie and fetch its cast and crew
		async.each(moviesArr, (movie, cb)=>{

	if(movie.genres==" "){
		movies.genres = []
	}
	var data
	http.request(`http://api.themoviedb.org/3/movie/${movie.id}/casts?api_key=068e3f59f93f5c2aa67262e9e9f3db73`, function(result) {
		  result.setEncoding('utf8');
		  result.on('data', function (chunk) {
		    // console.log('BODY: ' + chunk);
		    data+=chunk
		  });
		  result.on('end',()=>{
		  	i++;
		  	//Create a new movie
		  	/*var tmp = new Movie({
			budget: movie.budget,
			genres: movie.genres,
			homepage: movie.homepage,
			id: Math.round(movie.id),
			imdb_id: movie.imdb_id,
			original_language: movie.original_language,
			original_title: movie.original_title,
			overview: movie.overview,
			poster_path: movie.poster_path,
			release_date: movie.release_date,
			revenue: movie.revenue,
			runtime: movie.runtime,
			status: movie.status,
			title: movie.title,
			tagline: movie.tagline,
			vote_average: movie.vote_average,
			vote_count: movie.vote_count,
			popularity: movie.popularity,
			belongs_to_collection: movie.belongs_to_collection
			cast_and_crew: 
			})*/
			var cast_and_crew = data.substring(9)
			   // console.log(result)
			cast_and_crew = JSON.parse(cast_and_crew)
			console.log('----------------------------------------------------------------------------------')
			console.log(`http://api.themoviedb.org/3/movie/${movie.id}/casts?api_key=068e3f59f93f5c2aa67262e9e9f3db73`)
			console.log('---------------------')
			console.log('Got cast and crew for movieId '+movie.id + '\t'+i)
			console.log('----------------------------------------------------------------------------------')
			newCastList.push({movieId: movie.id, cast_and_crew: cast_and_crew})
			 if(i%35==0)
			 setTimeout(function() {
		       console.log('Waiting for 11000ms');
		       			cb()
		    }, 11000);
		  })
		  result.on('error', (err)=>{
		  	console.log(err)
		  	callback(null,cast_and_crew)
		  })
	}).end();
	 
	},(err)=>{
		// All cast data has been retrieved till now
		//Call next function
		callback(null,newCastList)
	})

	},(cast_and_crew, callback)=>{
		console.log('Received all Data!')
		fs.writeFileSync('./cast_and_crew.json',JSON.stringify(cast_and_crew))
		callback(null)

	}],(err, result)=>{
		console.log('Over!')
	})